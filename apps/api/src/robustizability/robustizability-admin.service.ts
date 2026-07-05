import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRobustizabilityRolloutGuidance,
  robustizabilityAdminActionRequestSchema,
  robustizabilityAdminActionResponseSchema,
  robustizabilityAdminSummaryResponseSchema,
  robustizabilityCapabilitiesResponseSchema,
  robustizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRobustizabilityAdminRecords,
  buildRobustizabilityAdminStats,
  getRobustizabilityAdminGuidance,
  resolveRobustizabilityAdminActions,
} from './robustizability-admin.helpers.js'
import { evaluateRobustizabilityRollout } from './robustizability-rollout.helpers.js'
import { RobustizabilityStatusService } from './robustizability-status.service.js'

@Injectable()
export class RobustizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly robustizabilityStatusService: RobustizabilityStatusService,
  ) {}

  getCapabilities() {
    return robustizabilityCapabilitiesResponseSchema.parse({
      supportsRobustizabilityRollout: true,
      supportsRobustizabilityAdminTools: true,
      supportsBillingInvoiceRobustizabilitySignals: true,
      supportsBillingRecordRobustizabilitySignals: true,
      guidance: getRobustizabilityRolloutGuidance(),
    })
  }

  async getRobustizabilityRollout() {
    const robustizabilityTableCoverage =
      await this.robustizabilityStatusService.getRobustizabilityTableCoverage()

    const rollout = evaluateRobustizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.robustizabilityStatusService.pingPostgres(),
      existingRobustizabilityTableCount: robustizabilityTableCoverage.existingRobustizabilityTableCount,
      billingInvoicesTableExists: robustizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: robustizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: robustizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return robustizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRobustizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRobustizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.robustizabilityStatusService.getWorkspaceRobustizabilityInventory(
        workspaceId,
      )
    const records = buildRobustizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.robustizabilityStatusService.pingPostgres()
    const stats = buildRobustizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return robustizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRobustizabilityAdminActions(),
      guidance: getRobustizabilityAdminGuidance({ stats }),
    })
  }

  async executeRobustizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_robustizability_summary'
    },
  ) {
    this.assertCanManageRobustizability(authContext)

    const payload = robustizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_robustizability_summary': {
        const summary = await this.getWorkspaceRobustizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return robustizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed robustizability summary with ${summary.stats.robustizabilityPercent}% billing invoice robustizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRobustizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production robustizability tools.',
    })
  }
}

import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getInferencizabilityRolloutGuidance,
  inferencizabilityAdminActionRequestSchema,
  inferencizabilityAdminActionResponseSchema,
  inferencizabilityAdminSummaryResponseSchema,
  inferencizabilityCapabilitiesResponseSchema,
  inferencizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildInferencizabilityAdminRecords,
  buildInferencizabilityAdminStats,
  getInferencizabilityAdminGuidance,
  resolveInferencizabilityAdminActions,
} from './inferencizability-admin.helpers.js'
import { evaluateInferencizabilityRollout } from './inferencizability-rollout.helpers.js'
import { InferencizabilityStatusService } from './inferencizability-status.service.js'

@Injectable()
export class InferencizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly inferencizabilityStatusService: InferencizabilityStatusService,
  ) {}

  getCapabilities() {
    return inferencizabilityCapabilitiesResponseSchema.parse({
      supportsInferencizabilityRollout: true,
      supportsInferencizabilityAdminTools: true,
      supportsBillingInvoiceInferencizabilitySignals: true,
      supportsBillingRecordInferencizabilitySignals: true,
      guidance: getInferencizabilityRolloutGuidance(),
    })
  }

  async getInferencizabilityRollout() {
    const inferencizabilityTableCoverage =
      await this.inferencizabilityStatusService.getInferencizabilityTableCoverage()

    const rollout = evaluateInferencizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.inferencizabilityStatusService.pingPostgres(),
      existingInferencizabilityTableCount: inferencizabilityTableCoverage.existingInferencizabilityTableCount,
      billingInvoicesTableExists: inferencizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: inferencizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: inferencizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return inferencizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceInferencizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageInferencizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.inferencizabilityStatusService.getWorkspaceInferencizabilityInventory(
        workspaceId,
      )
    const records = buildInferencizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.inferencizabilityStatusService.pingPostgres()
    const stats = buildInferencizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return inferencizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveInferencizabilityAdminActions(),
      guidance: getInferencizabilityAdminGuidance({ stats }),
    })
  }

  async executeInferencizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_inferencizability_summary'
    },
  ) {
    this.assertCanManageInferencizability(authContext)

    const payload = inferencizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_inferencizability_summary': {
        const summary = await this.getWorkspaceInferencizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return inferencizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed inferencizability summary with ${summary.stats.inferencizabilityPercent}% billing invoice inferencizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageInferencizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production inferencizability tools.',
    })
  }
}

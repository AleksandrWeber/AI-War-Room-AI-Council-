import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAxiologizabilityRolloutGuidance,
  axiologizabilityAdminActionRequestSchema,
  axiologizabilityAdminActionResponseSchema,
  axiologizabilityAdminSummaryResponseSchema,
  axiologizabilityCapabilitiesResponseSchema,
  axiologizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAxiologizabilityAdminRecords,
  buildAxiologizabilityAdminStats,
  getAxiologizabilityAdminGuidance,
  resolveAxiologizabilityAdminActions,
} from './axiologizability-admin.helpers.js'
import { evaluateAxiologizabilityRollout } from './axiologizability-rollout.helpers.js'
import { AxiologizabilityStatusService } from './axiologizability-status.service.js'

@Injectable()
export class AxiologizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly axiologizabilityStatusService: AxiologizabilityStatusService,
  ) {}

  getCapabilities() {
    return axiologizabilityCapabilitiesResponseSchema.parse({
      supportsAxiologizabilityRollout: true,
      supportsAxiologizabilityAdminTools: true,
      supportsBillingNotificationAxiologizabilitySignals: true,
      supportsBillingWebhookAxiologizabilitySignals: true,
      guidance: getAxiologizabilityRolloutGuidance(),
    })
  }

  async getAxiologizabilityRollout() {
    const axiologizabilityTableCoverage =
      await this.axiologizabilityStatusService.getAxiologizabilityTableCoverage()

    const rollout = evaluateAxiologizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.axiologizabilityStatusService.pingPostgres(),
      existingAxiologizabilityTableCount: axiologizabilityTableCoverage.existingAxiologizabilityTableCount,
      billingNotificationsTableExists: axiologizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: axiologizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: axiologizabilityTableCoverage.usageEventsTableExists,
    })

    return axiologizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAxiologizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAxiologizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.axiologizabilityStatusService.getWorkspaceAxiologizabilityInventory(
        workspaceId,
      )
    const records = buildAxiologizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.axiologizabilityStatusService.pingPostgres()
    const stats = buildAxiologizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return axiologizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAxiologizabilityAdminActions(),
      guidance: getAxiologizabilityAdminGuidance({ stats }),
    })
  }

  async executeAxiologizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_axiologizability_summary'
    },
  ) {
    this.assertCanManageAxiologizability(authContext)

    const payload = axiologizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_axiologizability_summary': {
        const summary = await this.getWorkspaceAxiologizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return axiologizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed axiologizability summary with ${summary.stats.axiologizabilityPercent}% billing notification axiologizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAxiologizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production axiologizability tools.',
    })
  }
}

import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getOrdinarizabilityRolloutGuidance,
  ordinarizabilityAdminActionRequestSchema,
  ordinarizabilityAdminActionResponseSchema,
  ordinarizabilityAdminSummaryResponseSchema,
  ordinarizabilityCapabilitiesResponseSchema,
  ordinarizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildOrdinarizabilityAdminRecords,
  buildOrdinarizabilityAdminStats,
  getOrdinarizabilityAdminGuidance,
  resolveOrdinarizabilityAdminActions,
} from './ordinarizability-admin.helpers.js'
import { evaluateOrdinarizabilityRollout } from './ordinarizability-rollout.helpers.js'
import { OrdinarizabilityStatusService } from './ordinarizability-status.service.js'

@Injectable()
export class OrdinarizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly ordinarizabilityStatusService: OrdinarizabilityStatusService,
  ) {}

  getCapabilities() {
    return ordinarizabilityCapabilitiesResponseSchema.parse({
      supportsOrdinarizabilityRollout: true,
      supportsOrdinarizabilityAdminTools: true,
      supportsBillingNotificationOrdinarizabilitySignals: true,
      supportsBillingWebhookOrdinarizabilitySignals: true,
      guidance: getOrdinarizabilityRolloutGuidance(),
    })
  }

  async getOrdinarizabilityRollout() {
    const ordinarizabilityTableCoverage =
      await this.ordinarizabilityStatusService.getOrdinarizabilityTableCoverage()

    const rollout = evaluateOrdinarizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.ordinarizabilityStatusService.pingPostgres(),
      existingOrdinarizabilityTableCount: ordinarizabilityTableCoverage.existingOrdinarizabilityTableCount,
      billingNotificationsTableExists: ordinarizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: ordinarizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: ordinarizabilityTableCoverage.usageEventsTableExists,
    })

    return ordinarizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceOrdinarizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageOrdinarizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.ordinarizabilityStatusService.getWorkspaceOrdinarizabilityInventory(
        workspaceId,
      )
    const records = buildOrdinarizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.ordinarizabilityStatusService.pingPostgres()
    const stats = buildOrdinarizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return ordinarizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveOrdinarizabilityAdminActions(),
      guidance: getOrdinarizabilityAdminGuidance({ stats }),
    })
  }

  async executeOrdinarizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_ordinarizability_summary'
    },
  ) {
    this.assertCanManageOrdinarizability(authContext)

    const payload = ordinarizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_ordinarizability_summary': {
        const summary = await this.getWorkspaceOrdinarizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return ordinarizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed ordinarizability summary with ${summary.stats.ordinarizabilityPercent}% billing notification ordinarizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageOrdinarizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production ordinarizability tools.',
    })
  }
}

import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getFootnotizabilityRolloutGuidance,
  footnotizabilityAdminActionRequestSchema,
  footnotizabilityAdminActionResponseSchema,
  footnotizabilityAdminSummaryResponseSchema,
  footnotizabilityCapabilitiesResponseSchema,
  footnotizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildFootnotizabilityAdminRecords,
  buildFootnotizabilityAdminStats,
  getFootnotizabilityAdminGuidance,
  resolveFootnotizabilityAdminActions,
} from './footnotizability-admin.helpers.js'
import { evaluateFootnotizabilityRollout } from './footnotizability-rollout.helpers.js'
import { FootnotizabilityStatusService } from './footnotizability-status.service.js'

@Injectable()
export class FootnotizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly footnotizabilityStatusService: FootnotizabilityStatusService,
  ) {}

  getCapabilities() {
    return footnotizabilityCapabilitiesResponseSchema.parse({
      supportsFootnotizabilityRollout: true,
      supportsFootnotizabilityAdminTools: true,
      supportsBillingNotificationFootnotizabilitySignals: true,
      supportsBillingWebhookFootnotizabilitySignals: true,
      guidance: getFootnotizabilityRolloutGuidance(),
    })
  }

  async getFootnotizabilityRollout() {
    const footnotizabilityTableCoverage =
      await this.footnotizabilityStatusService.getFootnotizabilityTableCoverage()

    const rollout = evaluateFootnotizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.footnotizabilityStatusService.pingPostgres(),
      existingFootnotizabilityTableCount: footnotizabilityTableCoverage.existingFootnotizabilityTableCount,
      billingNotificationsTableExists: footnotizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: footnotizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: footnotizabilityTableCoverage.usageEventsTableExists,
    })

    return footnotizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceFootnotizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageFootnotizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.footnotizabilityStatusService.getWorkspaceFootnotizabilityInventory(
        workspaceId,
      )
    const records = buildFootnotizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.footnotizabilityStatusService.pingPostgres()
    const stats = buildFootnotizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return footnotizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveFootnotizabilityAdminActions(),
      guidance: getFootnotizabilityAdminGuidance({ stats }),
    })
  }

  async executeFootnotizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_footnotizability_summary'
    },
  ) {
    this.assertCanManageFootnotizability(authContext)

    const payload = footnotizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_footnotizability_summary': {
        const summary = await this.getWorkspaceFootnotizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return footnotizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed footnotizability summary with ${summary.stats.footnotizabilityPercent}% billing notification footnotizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageFootnotizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production footnotizability tools.',
    })
  }
}

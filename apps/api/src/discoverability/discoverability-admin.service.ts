import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDiscoverabilityRolloutGuidance,
  discoverabilityAdminActionRequestSchema,
  discoverabilityAdminActionResponseSchema,
  discoverabilityAdminSummaryResponseSchema,
  discoverabilityCapabilitiesResponseSchema,
  discoverabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDiscoverabilityAdminRecords,
  buildDiscoverabilityAdminStats,
  getDiscoverabilityAdminGuidance,
  resolveDiscoverabilityAdminActions,
} from './discoverability-admin.helpers.js'
import { evaluateDiscoverabilityRollout } from './discoverability-rollout.helpers.js'
import { DiscoverabilityStatusService } from './discoverability-status.service.js'

@Injectable()
export class DiscoverabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly discoverabilityStatusService: DiscoverabilityStatusService,
  ) {}

  getCapabilities() {
    return discoverabilityCapabilitiesResponseSchema.parse({
      supportsDiscoverabilityRollout: true,
      supportsDiscoverabilityAdminTools: true,
      supportsMeterUsageDiscoverabilitySignals: true,
      supportsBillingNotificationDiscoverabilitySignals: true,
      guidance: getDiscoverabilityRolloutGuidance(),
    })
  }

  async getDiscoverabilityRollout() {
    const discoverabilityTableCoverage =
      await this.discoverabilityStatusService.getDiscoverabilityTableCoverage()

    const rollout = evaluateDiscoverabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.discoverabilityStatusService.pingPostgres(),
      existingDiscoverabilityTableCount: discoverabilityTableCoverage.existingDiscoverabilityTableCount,
      billingMeterUsageReportsTableExists: discoverabilityTableCoverage.billingMeterUsageReportsTableExists,
      billingNotificationsTableExists: discoverabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: discoverabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return discoverabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDiscoverabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDiscoverability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.discoverabilityStatusService.getWorkspaceDiscoverabilityInventory(
        workspaceId,
      )
    const records = buildDiscoverabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.discoverabilityStatusService.pingPostgres()
    const stats = buildDiscoverabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return discoverabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDiscoverabilityAdminActions(),
      guidance: getDiscoverabilityAdminGuidance({ stats }),
    })
  }

  async executeDiscoverabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_discoverability_summary'
    },
  ) {
    this.assertCanManageDiscoverability(authContext)

    const payload = discoverabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_discoverability_summary': {
        const summary = await this.getWorkspaceDiscoverabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return discoverabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed discoverability summary with ${summary.stats.discoverabilityPercent}% meter usage discoverability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDiscoverability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production discoverability tools.',
    })
  }
}

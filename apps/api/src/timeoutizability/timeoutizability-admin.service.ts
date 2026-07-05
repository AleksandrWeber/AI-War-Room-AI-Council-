import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTimeoutizabilityRolloutGuidance,
  timeoutizabilityAdminActionRequestSchema,
  timeoutizabilityAdminActionResponseSchema,
  timeoutizabilityAdminSummaryResponseSchema,
  timeoutizabilityCapabilitiesResponseSchema,
  timeoutizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTimeoutizabilityAdminRecords,
  buildTimeoutizabilityAdminStats,
  getTimeoutizabilityAdminGuidance,
  resolveTimeoutizabilityAdminActions,
} from './timeoutizability-admin.helpers.js'
import { evaluateTimeoutizabilityRollout } from './timeoutizability-rollout.helpers.js'
import { TimeoutizabilityStatusService } from './timeoutizability-status.service.js'

@Injectable()
export class TimeoutizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly timeoutizabilityStatusService: TimeoutizabilityStatusService,
  ) {}

  getCapabilities() {
    return timeoutizabilityCapabilitiesResponseSchema.parse({
      supportsTimeoutizabilityRollout: true,
      supportsTimeoutizabilityAdminTools: true,
      supportsBillingNotificationTimeoutizabilitySignals: true,
      supportsBillingWebhookTimeoutizabilitySignals: true,
      guidance: getTimeoutizabilityRolloutGuidance(),
    })
  }

  async getTimeoutizabilityRollout() {
    const timeoutizabilityTableCoverage =
      await this.timeoutizabilityStatusService.getTimeoutizabilityTableCoverage()

    const rollout = evaluateTimeoutizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.timeoutizabilityStatusService.pingPostgres(),
      existingTimeoutizabilityTableCount: timeoutizabilityTableCoverage.existingTimeoutizabilityTableCount,
      billingNotificationsTableExists: timeoutizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: timeoutizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: timeoutizabilityTableCoverage.usageEventsTableExists,
    })

    return timeoutizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTimeoutizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTimeoutizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.timeoutizabilityStatusService.getWorkspaceTimeoutizabilityInventory(
        workspaceId,
      )
    const records = buildTimeoutizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.timeoutizabilityStatusService.pingPostgres()
    const stats = buildTimeoutizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return timeoutizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTimeoutizabilityAdminActions(),
      guidance: getTimeoutizabilityAdminGuidance({ stats }),
    })
  }

  async executeTimeoutizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_timeoutizability_summary'
    },
  ) {
    this.assertCanManageTimeoutizability(authContext)

    const payload = timeoutizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_timeoutizability_summary': {
        const summary = await this.getWorkspaceTimeoutizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return timeoutizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed timeoutizability summary with ${summary.stats.timeoutizabilityPercent}% billing notification timeoutizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTimeoutizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production timeoutizability tools.',
    })
  }
}

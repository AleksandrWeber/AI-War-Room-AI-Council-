import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getNotifizabilityRolloutGuidance,
  notifizabilityAdminActionRequestSchema,
  notifizabilityAdminActionResponseSchema,
  notifizabilityAdminSummaryResponseSchema,
  notifizabilityCapabilitiesResponseSchema,
  notifizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildNotifizabilityAdminRecords,
  buildNotifizabilityAdminStats,
  getNotifizabilityAdminGuidance,
  resolveNotifizabilityAdminActions,
} from './notifizability-admin.helpers.js'
import { evaluateNotifizabilityRollout } from './notifizability-rollout.helpers.js'
import { NotifizabilityStatusService } from './notifizability-status.service.js'

@Injectable()
export class NotifizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly notifizabilityStatusService: NotifizabilityStatusService,
  ) {}

  getCapabilities() {
    return notifizabilityCapabilitiesResponseSchema.parse({
      supportsNotifizabilityRollout: true,
      supportsNotifizabilityAdminTools: true,
      supportsBillingNotificationNotifizabilitySignals: true,
      supportsBillingWebhookNotifizabilitySignals: true,
      guidance: getNotifizabilityRolloutGuidance(),
    })
  }

  async getNotifizabilityRollout() {
    const notifizabilityTableCoverage =
      await this.notifizabilityStatusService.getNotifizabilityTableCoverage()

    const rollout = evaluateNotifizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.notifizabilityStatusService.pingPostgres(),
      existingNotifizabilityTableCount: notifizabilityTableCoverage.existingNotifizabilityTableCount,
      billingNotificationsTableExists: notifizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: notifizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: notifizabilityTableCoverage.usageEventsTableExists,
    })

    return notifizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceNotifizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageNotifizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.notifizabilityStatusService.getWorkspaceNotifizabilityInventory(
        workspaceId,
      )
    const records = buildNotifizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.notifizabilityStatusService.pingPostgres()
    const stats = buildNotifizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return notifizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveNotifizabilityAdminActions(),
      guidance: getNotifizabilityAdminGuidance({ stats }),
    })
  }

  async executeNotifizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_notifizability_summary'
    },
  ) {
    this.assertCanManageNotifizability(authContext)

    const payload = notifizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_notifizability_summary': {
        const summary = await this.getWorkspaceNotifizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return notifizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed notifizability summary with ${summary.stats.notifizabilityPercent}% billing notification notifizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageNotifizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production notifizability tools.',
    })
  }
}

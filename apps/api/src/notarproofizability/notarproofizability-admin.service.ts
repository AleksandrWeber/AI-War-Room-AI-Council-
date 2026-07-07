import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getNotarproofizabilityRolloutGuidance,
  notarproofizabilityAdminActionRequestSchema,
  notarproofizabilityAdminActionResponseSchema,
  notarproofizabilityAdminSummaryResponseSchema,
  notarproofizabilityCapabilitiesResponseSchema,
  notarproofizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildNotarproofizabilityAdminRecords,
  buildNotarproofizabilityAdminStats,
  getNotarproofizabilityAdminGuidance,
  resolveNotarproofizabilityAdminActions,
} from './notarproofizability-admin.helpers.js'
import { evaluateNotarproofizabilityRollout } from './notarproofizability-rollout.helpers.js'
import { NotarproofizabilityStatusService } from './notarproofizability-status.service.js'

@Injectable()
export class NotarproofizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly notarproofizabilityStatusService: NotarproofizabilityStatusService,
  ) {}

  getCapabilities() {
    return notarproofizabilityCapabilitiesResponseSchema.parse({
      supportsNotarproofizabilityRollout: true,
      supportsNotarproofizabilityAdminTools: true,
      supportsBillingNotificationNotarproofizabilitySignals: true,
      supportsBillingWebhookNotarproofizabilitySignals: true,
      guidance: getNotarproofizabilityRolloutGuidance(),
    })
  }

  async getNotarproofizabilityRollout() {
    const notarproofizabilityTableCoverage =
      await this.notarproofizabilityStatusService.getNotarproofizabilityTableCoverage()

    const rollout = evaluateNotarproofizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.notarproofizabilityStatusService.pingPostgres(),
      existingNotarproofizabilityTableCount: notarproofizabilityTableCoverage.existingNotarproofizabilityTableCount,
      billingNotificationsTableExists: notarproofizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: notarproofizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: notarproofizabilityTableCoverage.usageEventsTableExists,
    })

    return notarproofizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceNotarproofizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageNotarproofizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.notarproofizabilityStatusService.getWorkspaceNotarproofizabilityInventory(
        workspaceId,
      )
    const records = buildNotarproofizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.notarproofizabilityStatusService.pingPostgres()
    const stats = buildNotarproofizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return notarproofizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveNotarproofizabilityAdminActions(),
      guidance: getNotarproofizabilityAdminGuidance({ stats }),
    })
  }

  async executeNotarproofizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_notarproofizability_summary'
    },
  ) {
    this.assertCanManageNotarproofizability(authContext)

    const payload = notarproofizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_notarproofizability_summary': {
        const summary = await this.getWorkspaceNotarproofizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return notarproofizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed notarproofizability summary with ${summary.stats.notarproofizabilityPercent}% billing notification notarproofizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageNotarproofizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production notarproofizability tools.',
    })
  }
}

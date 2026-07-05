import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getWindowizabilityRolloutGuidance,
  windowizabilityAdminActionRequestSchema,
  windowizabilityAdminActionResponseSchema,
  windowizabilityAdminSummaryResponseSchema,
  windowizabilityCapabilitiesResponseSchema,
  windowizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildWindowizabilityAdminRecords,
  buildWindowizabilityAdminStats,
  getWindowizabilityAdminGuidance,
  resolveWindowizabilityAdminActions,
} from './windowizability-admin.helpers.js'
import { evaluateWindowizabilityRollout } from './windowizability-rollout.helpers.js'
import { WindowizabilityStatusService } from './windowizability-status.service.js'

@Injectable()
export class WindowizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly windowizabilityStatusService: WindowizabilityStatusService,
  ) {}

  getCapabilities() {
    return windowizabilityCapabilitiesResponseSchema.parse({
      supportsWindowizabilityRollout: true,
      supportsWindowizabilityAdminTools: true,
      supportsBillingNotificationWindowizabilitySignals: true,
      supportsBillingWebhookWindowizabilitySignals: true,
      guidance: getWindowizabilityRolloutGuidance(),
    })
  }

  async getWindowizabilityRollout() {
    const windowizabilityTableCoverage =
      await this.windowizabilityStatusService.getWindowizabilityTableCoverage()

    const rollout = evaluateWindowizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.windowizabilityStatusService.pingPostgres(),
      existingWindowizabilityTableCount: windowizabilityTableCoverage.existingWindowizabilityTableCount,
      billingNotificationsTableExists: windowizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: windowizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: windowizabilityTableCoverage.usageEventsTableExists,
    })

    return windowizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceWindowizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageWindowizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.windowizabilityStatusService.getWorkspaceWindowizabilityInventory(
        workspaceId,
      )
    const records = buildWindowizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.windowizabilityStatusService.pingPostgres()
    const stats = buildWindowizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return windowizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveWindowizabilityAdminActions(),
      guidance: getWindowizabilityAdminGuidance({ stats }),
    })
  }

  async executeWindowizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_windowizability_summary'
    },
  ) {
    this.assertCanManageWindowizability(authContext)

    const payload = windowizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_windowizability_summary': {
        const summary = await this.getWorkspaceWindowizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return windowizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed windowizability summary with ${summary.stats.windowizabilityPercent}% billing notification windowizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageWindowizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production windowizability tools.',
    })
  }
}

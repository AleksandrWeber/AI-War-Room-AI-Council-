import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getPluggabilizabilityRolloutGuidance,
  pluggabilizabilityAdminActionRequestSchema,
  pluggabilizabilityAdminActionResponseSchema,
  pluggabilizabilityAdminSummaryResponseSchema,
  pluggabilizabilityCapabilitiesResponseSchema,
  pluggabilizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildPluggabilizabilityAdminRecords,
  buildPluggabilizabilityAdminStats,
  getPluggabilizabilityAdminGuidance,
  resolvePluggabilizabilityAdminActions,
} from './pluggabilizability-admin.helpers.js'
import { evaluatePluggabilizabilityRollout } from './pluggabilizability-rollout.helpers.js'
import { PluggabilizabilityStatusService } from './pluggabilizability-status.service.js'

@Injectable()
export class PluggabilizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly pluggabilizabilityStatusService: PluggabilizabilityStatusService,
  ) {}

  getCapabilities() {
    return pluggabilizabilityCapabilitiesResponseSchema.parse({
      supportsPluggabilizabilityRollout: true,
      supportsPluggabilizabilityAdminTools: true,
      supportsBillingNotificationPluggabilizabilitySignals: true,
      supportsBillingWebhookPluggabilizabilitySignals: true,
      guidance: getPluggabilizabilityRolloutGuidance(),
    })
  }

  async getPluggabilizabilityRollout() {
    const pluggabilizabilityTableCoverage =
      await this.pluggabilizabilityStatusService.getPluggabilizabilityTableCoverage()

    const rollout = evaluatePluggabilizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.pluggabilizabilityStatusService.pingPostgres(),
      existingPluggabilizabilityTableCount: pluggabilizabilityTableCoverage.existingPluggabilizabilityTableCount,
      billingNotificationsTableExists: pluggabilizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: pluggabilizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: pluggabilizabilityTableCoverage.usageEventsTableExists,
    })

    return pluggabilizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspacePluggabilizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManagePluggabilizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.pluggabilizabilityStatusService.getWorkspacePluggabilizabilityInventory(
        workspaceId,
      )
    const records = buildPluggabilizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.pluggabilizabilityStatusService.pingPostgres()
    const stats = buildPluggabilizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return pluggabilizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolvePluggabilizabilityAdminActions(),
      guidance: getPluggabilizabilityAdminGuidance({ stats }),
    })
  }

  async executePluggabilizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_pluggabilizability_summary'
    },
  ) {
    this.assertCanManagePluggabilizability(authContext)

    const payload = pluggabilizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_pluggabilizability_summary': {
        const summary = await this.getWorkspacePluggabilizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return pluggabilizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed pluggabilizability summary with ${summary.stats.pluggabilizabilityPercent}% billing notification pluggabilizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManagePluggabilizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production pluggabilizability tools.',
    })
  }
}

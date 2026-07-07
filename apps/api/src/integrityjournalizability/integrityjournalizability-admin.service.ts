import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getIntegrityjournalizabilityRolloutGuidance,
  integrityjournalizabilityAdminActionRequestSchema,
  integrityjournalizabilityAdminActionResponseSchema,
  integrityjournalizabilityAdminSummaryResponseSchema,
  integrityjournalizabilityCapabilitiesResponseSchema,
  integrityjournalizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildIntegrityjournalizabilityAdminRecords,
  buildIntegrityjournalizabilityAdminStats,
  getIntegrityjournalizabilityAdminGuidance,
  resolveIntegrityjournalizabilityAdminActions,
} from './integrityjournalizability-admin.helpers.js'
import { evaluateIntegrityjournalizabilityRollout } from './integrityjournalizability-rollout.helpers.js'
import { IntegrityjournalizabilityStatusService } from './integrityjournalizability-status.service.js'

@Injectable()
export class IntegrityjournalizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly integrityjournalizabilityStatusService: IntegrityjournalizabilityStatusService,
  ) {}

  getCapabilities() {
    return integrityjournalizabilityCapabilitiesResponseSchema.parse({
      supportsIntegrityjournalizabilityRollout: true,
      supportsIntegrityjournalizabilityAdminTools: true,
      supportsBillingNotificationIntegrityjournalizabilitySignals: true,
      supportsBillingWebhookIntegrityjournalizabilitySignals: true,
      guidance: getIntegrityjournalizabilityRolloutGuidance(),
    })
  }

  async getIntegrityjournalizabilityRollout() {
    const integrityjournalizabilityTableCoverage =
      await this.integrityjournalizabilityStatusService.getIntegrityjournalizabilityTableCoverage()

    const rollout = evaluateIntegrityjournalizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.integrityjournalizabilityStatusService.pingPostgres(),
      existingIntegrityjournalizabilityTableCount: integrityjournalizabilityTableCoverage.existingIntegrityjournalizabilityTableCount,
      billingNotificationsTableExists: integrityjournalizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: integrityjournalizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: integrityjournalizabilityTableCoverage.usageEventsTableExists,
    })

    return integrityjournalizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceIntegrityjournalizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageIntegrityjournalizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.integrityjournalizabilityStatusService.getWorkspaceIntegrityjournalizabilityInventory(
        workspaceId,
      )
    const records = buildIntegrityjournalizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.integrityjournalizabilityStatusService.pingPostgres()
    const stats = buildIntegrityjournalizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return integrityjournalizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveIntegrityjournalizabilityAdminActions(),
      guidance: getIntegrityjournalizabilityAdminGuidance({ stats }),
    })
  }

  async executeIntegrityjournalizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_integrityjournalizability_summary'
    },
  ) {
    this.assertCanManageIntegrityjournalizability(authContext)

    const payload = integrityjournalizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_integrityjournalizability_summary': {
        const summary = await this.getWorkspaceIntegrityjournalizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return integrityjournalizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed integrityjournalizability summary with ${summary.stats.integrityjournalizabilityPercent}% billing notification integrityjournalizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageIntegrityjournalizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production integrityjournalizability tools.',
    })
  }
}

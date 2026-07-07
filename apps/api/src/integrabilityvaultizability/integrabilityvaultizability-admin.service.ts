import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getIntegrabilityvaultizabilityRolloutGuidance,
  integrabilityvaultizabilityAdminActionRequestSchema,
  integrabilityvaultizabilityAdminActionResponseSchema,
  integrabilityvaultizabilityAdminSummaryResponseSchema,
  integrabilityvaultizabilityCapabilitiesResponseSchema,
  integrabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildIntegrabilityvaultizabilityAdminRecords,
  buildIntegrabilityvaultizabilityAdminStats,
  getIntegrabilityvaultizabilityAdminGuidance,
  resolveIntegrabilityvaultizabilityAdminActions,
} from './integrabilityvaultizability-admin.helpers.js'
import { evaluateIntegrabilityvaultizabilityRollout } from './integrabilityvaultizability-rollout.helpers.js'
import { IntegrabilityvaultizabilityStatusService } from './integrabilityvaultizability-status.service.js'

@Injectable()
export class IntegrabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly integrabilityvaultizabilityStatusService: IntegrabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return integrabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsIntegrabilityvaultizabilityRollout: true,
      supportsIntegrabilityvaultizabilityAdminTools: true,
      supportsBillingNotificationIntegrabilityvaultizabilitySignals: true,
      supportsBillingWebhookIntegrabilityvaultizabilitySignals: true,
      guidance: getIntegrabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getIntegrabilityvaultizabilityRollout() {
    const integrabilityvaultizabilityTableCoverage =
      await this.integrabilityvaultizabilityStatusService.getIntegrabilityvaultizabilityTableCoverage()

    const rollout = evaluateIntegrabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.integrabilityvaultizabilityStatusService.pingPostgres(),
      existingIntegrabilityvaultizabilityTableCount: integrabilityvaultizabilityTableCoverage.existingIntegrabilityvaultizabilityTableCount,
      billingNotificationsTableExists: integrabilityvaultizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: integrabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: integrabilityvaultizabilityTableCoverage.usageEventsTableExists,
    })

    return integrabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceIntegrabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageIntegrabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.integrabilityvaultizabilityStatusService.getWorkspaceIntegrabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildIntegrabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.integrabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildIntegrabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return integrabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveIntegrabilityvaultizabilityAdminActions(),
      guidance: getIntegrabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeIntegrabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_integrabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageIntegrabilityvaultizability(authContext)

    const payload = integrabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_integrabilityvaultizability_summary': {
        const summary = await this.getWorkspaceIntegrabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return integrabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed integrabilityvaultizability summary with ${summary.stats.integrabilityvaultizabilityPercent}% billing notification integrabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageIntegrabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production integrabilityvaultizability tools.',
    })
  }
}

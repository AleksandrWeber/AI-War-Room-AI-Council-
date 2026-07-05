import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getMetricizabilityRolloutGuidance,
  metricizabilityAdminActionRequestSchema,
  metricizabilityAdminActionResponseSchema,
  metricizabilityAdminSummaryResponseSchema,
  metricizabilityCapabilitiesResponseSchema,
  metricizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildMetricizabilityAdminRecords,
  buildMetricizabilityAdminStats,
  getMetricizabilityAdminGuidance,
  resolveMetricizabilityAdminActions,
} from './metricizability-admin.helpers.js'
import { evaluateMetricizabilityRollout } from './metricizability-rollout.helpers.js'
import { MetricizabilityStatusService } from './metricizability-status.service.js'

@Injectable()
export class MetricizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly metricizabilityStatusService: MetricizabilityStatusService,
  ) {}

  getCapabilities() {
    return metricizabilityCapabilitiesResponseSchema.parse({
      supportsMetricizabilityRollout: true,
      supportsMetricizabilityAdminTools: true,
      supportsIdempotencyKeyMetricizabilitySignals: true,
      supportsUsageEventMetricizabilitySignals: true,
      guidance: getMetricizabilityRolloutGuidance(),
    })
  }

  async getMetricizabilityRollout() {
    const metricizabilityTableCoverage =
      await this.metricizabilityStatusService.getMetricizabilityTableCoverage()

    const rollout = evaluateMetricizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.metricizabilityStatusService.pingPostgres(),
      existingMetricizabilityTableCount: metricizabilityTableCoverage.existingMetricizabilityTableCount,
      idempotencyKeysTableExists: metricizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: metricizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: metricizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return metricizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceMetricizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageMetricizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.metricizabilityStatusService.getWorkspaceMetricizabilityInventory(
        workspaceId,
      )
    const records = buildMetricizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.metricizabilityStatusService.pingPostgres()
    const stats = buildMetricizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return metricizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveMetricizabilityAdminActions(),
      guidance: getMetricizabilityAdminGuidance({ stats }),
    })
  }

  async executeMetricizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_metricizability_summary'
    },
  ) {
    this.assertCanManageMetricizability(authContext)

    const payload = metricizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_metricizability_summary': {
        const summary = await this.getWorkspaceMetricizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return metricizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed metricizability summary with ${summary.stats.metricizabilityPercent}% idempotency key metricizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageMetricizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production metricizability tools.',
    })
  }
}

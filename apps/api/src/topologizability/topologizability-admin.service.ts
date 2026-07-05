import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTopologizabilityRolloutGuidance,
  topologizabilityAdminActionRequestSchema,
  topologizabilityAdminActionResponseSchema,
  topologizabilityAdminSummaryResponseSchema,
  topologizabilityCapabilitiesResponseSchema,
  topologizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTopologizabilityAdminRecords,
  buildTopologizabilityAdminStats,
  getTopologizabilityAdminGuidance,
  resolveTopologizabilityAdminActions,
} from './topologizability-admin.helpers.js'
import { evaluateTopologizabilityRollout } from './topologizability-rollout.helpers.js'
import { TopologizabilityStatusService } from './topologizability-status.service.js'

@Injectable()
export class TopologizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly topologizabilityStatusService: TopologizabilityStatusService,
  ) {}

  getCapabilities() {
    return topologizabilityCapabilitiesResponseSchema.parse({
      supportsTopologizabilityRollout: true,
      supportsTopologizabilityAdminTools: true,
      supportsBillingWebhookTopologizabilitySignals: true,
      supportsBillingRecordTopologizabilitySignals: true,
      guidance: getTopologizabilityRolloutGuidance(),
    })
  }

  async getTopologizabilityRollout() {
    const topologizabilityTableCoverage =
      await this.topologizabilityStatusService.getTopologizabilityTableCoverage()

    const rollout = evaluateTopologizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.topologizabilityStatusService.pingPostgres(),
      existingTopologizabilityTableCount: topologizabilityTableCoverage.existingTopologizabilityTableCount,
      billingWebhookEventsTableExists: topologizabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: topologizabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: topologizabilityTableCoverage.usageEventsTableExists,
    })

    return topologizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTopologizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTopologizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.topologizabilityStatusService.getWorkspaceTopologizabilityInventory(
        workspaceId,
      )
    const records = buildTopologizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.topologizabilityStatusService.pingPostgres()
    const stats = buildTopologizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return topologizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTopologizabilityAdminActions(),
      guidance: getTopologizabilityAdminGuidance({ stats }),
    })
  }

  async executeTopologizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_topologizability_summary'
    },
  ) {
    this.assertCanManageTopologizability(authContext)

    const payload = topologizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_topologizability_summary': {
        const summary = await this.getWorkspaceTopologizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return topologizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed topologizability summary with ${summary.stats.topologizabilityPercent}% billing webhook topologizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTopologizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production topologizability tools.',
    })
  }
}

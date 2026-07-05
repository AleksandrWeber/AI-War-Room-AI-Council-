import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRebalanceizabilityRolloutGuidance,
  rebalanceizabilityAdminActionRequestSchema,
  rebalanceizabilityAdminActionResponseSchema,
  rebalanceizabilityAdminSummaryResponseSchema,
  rebalanceizabilityCapabilitiesResponseSchema,
  rebalanceizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRebalanceizabilityAdminRecords,
  buildRebalanceizabilityAdminStats,
  getRebalanceizabilityAdminGuidance,
  resolveRebalanceizabilityAdminActions,
} from './rebalanceizability-admin.helpers.js'
import { evaluateRebalanceizabilityRollout } from './rebalanceizability-rollout.helpers.js'
import { RebalanceizabilityStatusService } from './rebalanceizability-status.service.js'

@Injectable()
export class RebalanceizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly rebalanceizabilityStatusService: RebalanceizabilityStatusService,
  ) {}

  getCapabilities() {
    return rebalanceizabilityCapabilitiesResponseSchema.parse({
      supportsRebalanceizabilityRollout: true,
      supportsRebalanceizabilityAdminTools: true,
      supportsMeterUsageRebalanceizabilitySignals: true,
      supportsUsageEventRebalanceizabilitySignals: true,
      guidance: getRebalanceizabilityRolloutGuidance(),
    })
  }

  async getRebalanceizabilityRollout() {
    const rebalanceizabilityTableCoverage =
      await this.rebalanceizabilityStatusService.getRebalanceizabilityTableCoverage()

    const rollout = evaluateRebalanceizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.rebalanceizabilityStatusService.pingPostgres(),
      existingRebalanceizabilityTableCount: rebalanceizabilityTableCoverage.existingRebalanceizabilityTableCount,
      billingMeterUsageReportsTableExists: rebalanceizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: rebalanceizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: rebalanceizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return rebalanceizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRebalanceizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRebalanceizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.rebalanceizabilityStatusService.getWorkspaceRebalanceizabilityInventory(
        workspaceId,
      )
    const records = buildRebalanceizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.rebalanceizabilityStatusService.pingPostgres()
    const stats = buildRebalanceizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return rebalanceizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRebalanceizabilityAdminActions(),
      guidance: getRebalanceizabilityAdminGuidance({ stats }),
    })
  }

  async executeRebalanceizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_rebalanceizability_summary'
    },
  ) {
    this.assertCanManageRebalanceizability(authContext)

    const payload = rebalanceizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_rebalanceizability_summary': {
        const summary = await this.getWorkspaceRebalanceizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return rebalanceizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed rebalanceizability summary with ${summary.stats.rebalanceizabilityPercent}% meter usage rebalanceizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRebalanceizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production rebalanceizability tools.',
    })
  }
}

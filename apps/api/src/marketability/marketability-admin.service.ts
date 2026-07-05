import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getMarketabilityRolloutGuidance,
  marketabilityAdminActionRequestSchema,
  marketabilityAdminActionResponseSchema,
  marketabilityAdminSummaryResponseSchema,
  marketabilityCapabilitiesResponseSchema,
  marketabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildMarketabilityAdminRecords,
  buildMarketabilityAdminStats,
  getMarketabilityAdminGuidance,
  resolveMarketabilityAdminActions,
} from './marketability-admin.helpers.js'
import { evaluateMarketabilityRollout } from './marketability-rollout.helpers.js'
import { MarketabilityStatusService } from './marketability-status.service.js'

@Injectable()
export class MarketabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly marketabilityStatusService: MarketabilityStatusService,
  ) {}

  getCapabilities() {
    return marketabilityCapabilitiesResponseSchema.parse({
      supportsMarketabilityRollout: true,
      supportsMarketabilityAdminTools: true,
      supportsMembershipMarketabilitySignals: true,
      supportsMeterUsageMarketabilitySignals: true,
      guidance: getMarketabilityRolloutGuidance(),
    })
  }

  async getMarketabilityRollout() {
    const marketabilityTableCoverage =
      await this.marketabilityStatusService.getMarketabilityTableCoverage()

    const rollout = evaluateMarketabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.marketabilityStatusService.pingPostgres(),
      existingMarketabilityTableCount: marketabilityTableCoverage.existingMarketabilityTableCount,
      workspaceMembershipsTableExists: marketabilityTableCoverage.workspaceMembershipsTableExists,
      billingMeterUsageReportsTableExists: marketabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: marketabilityTableCoverage.usageEventsTableExists,
    })

    return marketabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceMarketabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageMarketability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.marketabilityStatusService.getWorkspaceMarketabilityInventory(
        workspaceId,
      )
    const records = buildMarketabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.marketabilityStatusService.pingPostgres()
    const stats = buildMarketabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return marketabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveMarketabilityAdminActions(),
      guidance: getMarketabilityAdminGuidance({ stats }),
    })
  }

  async executeMarketabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_marketability_summary'
    },
  ) {
    this.assertCanManageMarketability(authContext)

    const payload = marketabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_marketability_summary': {
        const summary = await this.getWorkspaceMarketabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return marketabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed marketability summary with ${summary.stats.marketabilityPercent}% membership marketability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageMarketability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production marketability tools.',
    })
  }
}

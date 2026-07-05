import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getStochasticizabilityRolloutGuidance,
  stochasticizabilityAdminActionRequestSchema,
  stochasticizabilityAdminActionResponseSchema,
  stochasticizabilityAdminSummaryResponseSchema,
  stochasticizabilityCapabilitiesResponseSchema,
  stochasticizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildStochasticizabilityAdminRecords,
  buildStochasticizabilityAdminStats,
  getStochasticizabilityAdminGuidance,
  resolveStochasticizabilityAdminActions,
} from './stochasticizability-admin.helpers.js'
import { evaluateStochasticizabilityRollout } from './stochasticizability-rollout.helpers.js'
import { StochasticizabilityStatusService } from './stochasticizability-status.service.js'

@Injectable()
export class StochasticizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly stochasticizabilityStatusService: StochasticizabilityStatusService,
  ) {}

  getCapabilities() {
    return stochasticizabilityCapabilitiesResponseSchema.parse({
      supportsStochasticizabilityRollout: true,
      supportsStochasticizabilityAdminTools: true,
      supportsMeterUsageStochasticizabilitySignals: true,
      supportsUsageEventStochasticizabilitySignals: true,
      guidance: getStochasticizabilityRolloutGuidance(),
    })
  }

  async getStochasticizabilityRollout() {
    const stochasticizabilityTableCoverage =
      await this.stochasticizabilityStatusService.getStochasticizabilityTableCoverage()

    const rollout = evaluateStochasticizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.stochasticizabilityStatusService.pingPostgres(),
      existingStochasticizabilityTableCount: stochasticizabilityTableCoverage.existingStochasticizabilityTableCount,
      billingMeterUsageReportsTableExists: stochasticizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: stochasticizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: stochasticizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return stochasticizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceStochasticizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageStochasticizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.stochasticizabilityStatusService.getWorkspaceStochasticizabilityInventory(
        workspaceId,
      )
    const records = buildStochasticizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.stochasticizabilityStatusService.pingPostgres()
    const stats = buildStochasticizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return stochasticizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveStochasticizabilityAdminActions(),
      guidance: getStochasticizabilityAdminGuidance({ stats }),
    })
  }

  async executeStochasticizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_stochasticizability_summary'
    },
  ) {
    this.assertCanManageStochasticizability(authContext)

    const payload = stochasticizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_stochasticizability_summary': {
        const summary = await this.getWorkspaceStochasticizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return stochasticizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed stochasticizability summary with ${summary.stats.stochasticizabilityPercent}% meter usage stochasticizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageStochasticizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production stochasticizability tools.',
    })
  }
}

import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getWarmizabilityRolloutGuidance,
  warmizabilityAdminActionRequestSchema,
  warmizabilityAdminActionResponseSchema,
  warmizabilityAdminSummaryResponseSchema,
  warmizabilityCapabilitiesResponseSchema,
  warmizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildWarmizabilityAdminRecords,
  buildWarmizabilityAdminStats,
  getWarmizabilityAdminGuidance,
  resolveWarmizabilityAdminActions,
} from './warmizability-admin.helpers.js'
import { evaluateWarmizabilityRollout } from './warmizability-rollout.helpers.js'
import { WarmizabilityStatusService } from './warmizability-status.service.js'

@Injectable()
export class WarmizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly warmizabilityStatusService: WarmizabilityStatusService,
  ) {}

  getCapabilities() {
    return warmizabilityCapabilitiesResponseSchema.parse({
      supportsWarmizabilityRollout: true,
      supportsWarmizabilityAdminTools: true,
      supportsMeterUsageWarmizabilitySignals: true,
      supportsUsageEventWarmizabilitySignals: true,
      guidance: getWarmizabilityRolloutGuidance(),
    })
  }

  async getWarmizabilityRollout() {
    const warmizabilityTableCoverage =
      await this.warmizabilityStatusService.getWarmizabilityTableCoverage()

    const rollout = evaluateWarmizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.warmizabilityStatusService.pingPostgres(),
      existingWarmizabilityTableCount: warmizabilityTableCoverage.existingWarmizabilityTableCount,
      billingMeterUsageReportsTableExists: warmizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: warmizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: warmizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return warmizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceWarmizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageWarmizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.warmizabilityStatusService.getWorkspaceWarmizabilityInventory(
        workspaceId,
      )
    const records = buildWarmizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.warmizabilityStatusService.pingPostgres()
    const stats = buildWarmizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return warmizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveWarmizabilityAdminActions(),
      guidance: getWarmizabilityAdminGuidance({ stats }),
    })
  }

  async executeWarmizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_warmizability_summary'
    },
  ) {
    this.assertCanManageWarmizability(authContext)

    const payload = warmizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_warmizability_summary': {
        const summary = await this.getWorkspaceWarmizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return warmizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed warmizability summary with ${summary.stats.warmizabilityPercent}% meter usage warmizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageWarmizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production warmizability tools.',
    })
  }
}

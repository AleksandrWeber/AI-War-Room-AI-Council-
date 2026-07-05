import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSchedulabilityRolloutGuidance,
  schedulabilityAdminActionRequestSchema,
  schedulabilityAdminActionResponseSchema,
  schedulabilityAdminSummaryResponseSchema,
  schedulabilityCapabilitiesResponseSchema,
  schedulabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSchedulabilityAdminRecords,
  buildSchedulabilityAdminStats,
  getSchedulabilityAdminGuidance,
  resolveSchedulabilityAdminActions,
} from './schedulability-admin.helpers.js'
import { evaluateSchedulabilityRollout } from './schedulability-rollout.helpers.js'
import { SchedulabilityStatusService } from './schedulability-status.service.js'

@Injectable()
export class SchedulabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly schedulabilityStatusService: SchedulabilityStatusService,
  ) {}

  getCapabilities() {
    return schedulabilityCapabilitiesResponseSchema.parse({
      supportsSchedulabilityRollout: true,
      supportsSchedulabilityAdminTools: true,
      supportsMeterUsageSchedulabilitySignals: true,
      supportsUsageEventSchedulabilitySignals: true,
      guidance: getSchedulabilityRolloutGuidance(),
    })
  }

  async getSchedulabilityRollout() {
    const schedulabilityTableCoverage =
      await this.schedulabilityStatusService.getSchedulabilityTableCoverage()

    const rollout = evaluateSchedulabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.schedulabilityStatusService.pingPostgres(),
      existingSchedulabilityTableCount: schedulabilityTableCoverage.existingSchedulabilityTableCount,
      billingMeterUsageReportsTableExists: schedulabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: schedulabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: schedulabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return schedulabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSchedulabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSchedulability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.schedulabilityStatusService.getWorkspaceSchedulabilityInventory(
        workspaceId,
      )
    const records = buildSchedulabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.schedulabilityStatusService.pingPostgres()
    const stats = buildSchedulabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return schedulabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSchedulabilityAdminActions(),
      guidance: getSchedulabilityAdminGuidance({ stats }),
    })
  }

  async executeSchedulabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_schedulability_summary'
    },
  ) {
    this.assertCanManageSchedulability(authContext)

    const payload = schedulabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_schedulability_summary': {
        const summary = await this.getWorkspaceSchedulabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return schedulabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed schedulability summary with ${summary.stats.schedulabilityPercent}% meter usage schedulability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSchedulability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production schedulability tools.',
    })
  }
}

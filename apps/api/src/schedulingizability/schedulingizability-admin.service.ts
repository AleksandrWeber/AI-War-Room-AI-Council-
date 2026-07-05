import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSchedulingizabilityRolloutGuidance,
  schedulingizabilityAdminActionRequestSchema,
  schedulingizabilityAdminActionResponseSchema,
  schedulingizabilityAdminSummaryResponseSchema,
  schedulingizabilityCapabilitiesResponseSchema,
  schedulingizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSchedulingizabilityAdminRecords,
  buildSchedulingizabilityAdminStats,
  getSchedulingizabilityAdminGuidance,
  resolveSchedulingizabilityAdminActions,
} from './schedulingizability-admin.helpers.js'
import { evaluateSchedulingizabilityRollout } from './schedulingizability-rollout.helpers.js'
import { SchedulingizabilityStatusService } from './schedulingizability-status.service.js'

@Injectable()
export class SchedulingizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly schedulingizabilityStatusService: SchedulingizabilityStatusService,
  ) {}

  getCapabilities() {
    return schedulingizabilityCapabilitiesResponseSchema.parse({
      supportsSchedulingizabilityRollout: true,
      supportsSchedulingizabilityAdminTools: true,
      supportsMeterUsageSchedulingizabilitySignals: true,
      supportsUsageEventSchedulingizabilitySignals: true,
      guidance: getSchedulingizabilityRolloutGuidance(),
    })
  }

  async getSchedulingizabilityRollout() {
    const schedulingizabilityTableCoverage =
      await this.schedulingizabilityStatusService.getSchedulingizabilityTableCoverage()

    const rollout = evaluateSchedulingizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.schedulingizabilityStatusService.pingPostgres(),
      existingSchedulingizabilityTableCount: schedulingizabilityTableCoverage.existingSchedulingizabilityTableCount,
      billingMeterUsageReportsTableExists: schedulingizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: schedulingizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: schedulingizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return schedulingizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSchedulingizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSchedulingizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.schedulingizabilityStatusService.getWorkspaceSchedulingizabilityInventory(
        workspaceId,
      )
    const records = buildSchedulingizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.schedulingizabilityStatusService.pingPostgres()
    const stats = buildSchedulingizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return schedulingizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSchedulingizabilityAdminActions(),
      guidance: getSchedulingizabilityAdminGuidance({ stats }),
    })
  }

  async executeSchedulingizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_schedulingizability_summary'
    },
  ) {
    this.assertCanManageSchedulingizability(authContext)

    const payload = schedulingizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_schedulingizability_summary': {
        const summary = await this.getWorkspaceSchedulingizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return schedulingizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed schedulingizability summary with ${summary.stats.schedulingizabilityPercent}% meter usage schedulingizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSchedulingizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production schedulingizability tools.',
    })
  }
}

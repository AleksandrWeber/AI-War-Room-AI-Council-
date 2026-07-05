import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getFanoutizabilityRolloutGuidance,
  fanoutizabilityAdminActionRequestSchema,
  fanoutizabilityAdminActionResponseSchema,
  fanoutizabilityAdminSummaryResponseSchema,
  fanoutizabilityCapabilitiesResponseSchema,
  fanoutizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildFanoutizabilityAdminRecords,
  buildFanoutizabilityAdminStats,
  getFanoutizabilityAdminGuidance,
  resolveFanoutizabilityAdminActions,
} from './fanoutizability-admin.helpers.js'
import { evaluateFanoutizabilityRollout } from './fanoutizability-rollout.helpers.js'
import { FanoutizabilityStatusService } from './fanoutizability-status.service.js'

@Injectable()
export class FanoutizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly fanoutizabilityStatusService: FanoutizabilityStatusService,
  ) {}

  getCapabilities() {
    return fanoutizabilityCapabilitiesResponseSchema.parse({
      supportsFanoutizabilityRollout: true,
      supportsFanoutizabilityAdminTools: true,
      supportsMeterUsageFanoutizabilitySignals: true,
      supportsUsageEventFanoutizabilitySignals: true,
      guidance: getFanoutizabilityRolloutGuidance(),
    })
  }

  async getFanoutizabilityRollout() {
    const fanoutizabilityTableCoverage =
      await this.fanoutizabilityStatusService.getFanoutizabilityTableCoverage()

    const rollout = evaluateFanoutizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.fanoutizabilityStatusService.pingPostgres(),
      existingFanoutizabilityTableCount: fanoutizabilityTableCoverage.existingFanoutizabilityTableCount,
      billingMeterUsageReportsTableExists: fanoutizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: fanoutizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: fanoutizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return fanoutizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceFanoutizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageFanoutizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.fanoutizabilityStatusService.getWorkspaceFanoutizabilityInventory(
        workspaceId,
      )
    const records = buildFanoutizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.fanoutizabilityStatusService.pingPostgres()
    const stats = buildFanoutizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return fanoutizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveFanoutizabilityAdminActions(),
      guidance: getFanoutizabilityAdminGuidance({ stats }),
    })
  }

  async executeFanoutizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_fanoutizability_summary'
    },
  ) {
    this.assertCanManageFanoutizability(authContext)

    const payload = fanoutizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_fanoutizability_summary': {
        const summary = await this.getWorkspaceFanoutizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return fanoutizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed fanoutizability summary with ${summary.stats.fanoutizabilityPercent}% meter usage fanoutizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageFanoutizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production fanoutizability tools.',
    })
  }
}

import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCanaryizabilityRolloutGuidance,
  canaryizabilityAdminActionRequestSchema,
  canaryizabilityAdminActionResponseSchema,
  canaryizabilityAdminSummaryResponseSchema,
  canaryizabilityCapabilitiesResponseSchema,
  canaryizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCanaryizabilityAdminRecords,
  buildCanaryizabilityAdminStats,
  getCanaryizabilityAdminGuidance,
  resolveCanaryizabilityAdminActions,
} from './canaryizability-admin.helpers.js'
import { evaluateCanaryizabilityRollout } from './canaryizability-rollout.helpers.js'
import { CanaryizabilityStatusService } from './canaryizability-status.service.js'

@Injectable()
export class CanaryizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly canaryizabilityStatusService: CanaryizabilityStatusService,
  ) {}

  getCapabilities() {
    return canaryizabilityCapabilitiesResponseSchema.parse({
      supportsCanaryizabilityRollout: true,
      supportsCanaryizabilityAdminTools: true,
      supportsMeterUsageCanaryizabilitySignals: true,
      supportsUsageEventCanaryizabilitySignals: true,
      guidance: getCanaryizabilityRolloutGuidance(),
    })
  }

  async getCanaryizabilityRollout() {
    const canaryizabilityTableCoverage =
      await this.canaryizabilityStatusService.getCanaryizabilityTableCoverage()

    const rollout = evaluateCanaryizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.canaryizabilityStatusService.pingPostgres(),
      existingCanaryizabilityTableCount: canaryizabilityTableCoverage.existingCanaryizabilityTableCount,
      billingMeterUsageReportsTableExists: canaryizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: canaryizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: canaryizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return canaryizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCanaryizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCanaryizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.canaryizabilityStatusService.getWorkspaceCanaryizabilityInventory(
        workspaceId,
      )
    const records = buildCanaryizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.canaryizabilityStatusService.pingPostgres()
    const stats = buildCanaryizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return canaryizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCanaryizabilityAdminActions(),
      guidance: getCanaryizabilityAdminGuidance({ stats }),
    })
  }

  async executeCanaryizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_canaryizability_summary'
    },
  ) {
    this.assertCanManageCanaryizability(authContext)

    const payload = canaryizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_canaryizability_summary': {
        const summary = await this.getWorkspaceCanaryizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return canaryizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed canaryizability summary with ${summary.stats.canaryizabilityPercent}% meter usage canaryizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCanaryizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production canaryizability tools.',
    })
  }
}

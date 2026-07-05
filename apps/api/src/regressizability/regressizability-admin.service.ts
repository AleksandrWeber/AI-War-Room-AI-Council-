import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRegressizabilityRolloutGuidance,
  regressizabilityAdminActionRequestSchema,
  regressizabilityAdminActionResponseSchema,
  regressizabilityAdminSummaryResponseSchema,
  regressizabilityCapabilitiesResponseSchema,
  regressizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRegressizabilityAdminRecords,
  buildRegressizabilityAdminStats,
  getRegressizabilityAdminGuidance,
  resolveRegressizabilityAdminActions,
} from './regressizability-admin.helpers.js'
import { evaluateRegressizabilityRollout } from './regressizability-rollout.helpers.js'
import { RegressizabilityStatusService } from './regressizability-status.service.js'

@Injectable()
export class RegressizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly regressizabilityStatusService: RegressizabilityStatusService,
  ) {}

  getCapabilities() {
    return regressizabilityCapabilitiesResponseSchema.parse({
      supportsRegressizabilityRollout: true,
      supportsRegressizabilityAdminTools: true,
      supportsMeterUsageRegressizabilitySignals: true,
      supportsUsageEventRegressizabilitySignals: true,
      guidance: getRegressizabilityRolloutGuidance(),
    })
  }

  async getRegressizabilityRollout() {
    const regressizabilityTableCoverage =
      await this.regressizabilityStatusService.getRegressizabilityTableCoverage()

    const rollout = evaluateRegressizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.regressizabilityStatusService.pingPostgres(),
      existingRegressizabilityTableCount: regressizabilityTableCoverage.existingRegressizabilityTableCount,
      billingMeterUsageReportsTableExists: regressizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: regressizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: regressizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return regressizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRegressizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRegressizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.regressizabilityStatusService.getWorkspaceRegressizabilityInventory(
        workspaceId,
      )
    const records = buildRegressizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.regressizabilityStatusService.pingPostgres()
    const stats = buildRegressizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return regressizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRegressizabilityAdminActions(),
      guidance: getRegressizabilityAdminGuidance({ stats }),
    })
  }

  async executeRegressizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_regressizability_summary'
    },
  ) {
    this.assertCanManageRegressizability(authContext)

    const payload = regressizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_regressizability_summary': {
        const summary = await this.getWorkspaceRegressizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return regressizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed regressizability summary with ${summary.stats.regressizabilityPercent}% meter usage regressizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRegressizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production regressizability tools.',
    })
  }
}

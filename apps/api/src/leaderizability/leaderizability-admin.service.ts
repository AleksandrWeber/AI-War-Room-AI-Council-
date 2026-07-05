import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getLeaderizabilityRolloutGuidance,
  leaderizabilityAdminActionRequestSchema,
  leaderizabilityAdminActionResponseSchema,
  leaderizabilityAdminSummaryResponseSchema,
  leaderizabilityCapabilitiesResponseSchema,
  leaderizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildLeaderizabilityAdminRecords,
  buildLeaderizabilityAdminStats,
  getLeaderizabilityAdminGuidance,
  resolveLeaderizabilityAdminActions,
} from './leaderizability-admin.helpers.js'
import { evaluateLeaderizabilityRollout } from './leaderizability-rollout.helpers.js'
import { LeaderizabilityStatusService } from './leaderizability-status.service.js'

@Injectable()
export class LeaderizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly leaderizabilityStatusService: LeaderizabilityStatusService,
  ) {}

  getCapabilities() {
    return leaderizabilityCapabilitiesResponseSchema.parse({
      supportsLeaderizabilityRollout: true,
      supportsLeaderizabilityAdminTools: true,
      supportsWorkspaceLimitLeaderizabilitySignals: true,
      supportsUsageEventLeaderizabilitySignals: true,
      guidance: getLeaderizabilityRolloutGuidance(),
    })
  }

  async getLeaderizabilityRollout() {
    const leaderizabilityTableCoverage =
      await this.leaderizabilityStatusService.getLeaderizabilityTableCoverage()

    const rollout = evaluateLeaderizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.leaderizabilityStatusService.pingPostgres(),
      existingLeaderizabilityTableCount: leaderizabilityTableCoverage.existingLeaderizabilityTableCount,
      workspaceUsageLimitsTableExists: leaderizabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: leaderizabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: leaderizabilityTableCoverage.billingRecordsTableExists,
    })

    return leaderizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceLeaderizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageLeaderizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.leaderizabilityStatusService.getWorkspaceLeaderizabilityInventory(
        workspaceId,
      )
    const records = buildLeaderizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.leaderizabilityStatusService.pingPostgres()
    const stats = buildLeaderizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return leaderizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveLeaderizabilityAdminActions(),
      guidance: getLeaderizabilityAdminGuidance({ stats }),
    })
  }

  async executeLeaderizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_leaderizability_summary'
    },
  ) {
    this.assertCanManageLeaderizability(authContext)

    const payload = leaderizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_leaderizability_summary': {
        const summary = await this.getWorkspaceLeaderizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return leaderizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed leaderizability summary with ${summary.stats.leaderizabilityPercent}% workspace limit leaderizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageLeaderizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production leaderizability tools.',
    })
  }
}

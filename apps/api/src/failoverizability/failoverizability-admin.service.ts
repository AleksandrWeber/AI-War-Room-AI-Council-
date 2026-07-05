import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getFailoverizabilityRolloutGuidance,
  failoverizabilityAdminActionRequestSchema,
  failoverizabilityAdminActionResponseSchema,
  failoverizabilityAdminSummaryResponseSchema,
  failoverizabilityCapabilitiesResponseSchema,
  failoverizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildFailoverizabilityAdminRecords,
  buildFailoverizabilityAdminStats,
  getFailoverizabilityAdminGuidance,
  resolveFailoverizabilityAdminActions,
} from './failoverizability-admin.helpers.js'
import { evaluateFailoverizabilityRollout } from './failoverizability-rollout.helpers.js'
import { FailoverizabilityStatusService } from './failoverizability-status.service.js'

@Injectable()
export class FailoverizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly failoverizabilityStatusService: FailoverizabilityStatusService,
  ) {}

  getCapabilities() {
    return failoverizabilityCapabilitiesResponseSchema.parse({
      supportsFailoverizabilityRollout: true,
      supportsFailoverizabilityAdminTools: true,
      supportsWorkspaceLimitFailoverizabilitySignals: true,
      supportsUsageEventFailoverizabilitySignals: true,
      guidance: getFailoverizabilityRolloutGuidance(),
    })
  }

  async getFailoverizabilityRollout() {
    const failoverizabilityTableCoverage =
      await this.failoverizabilityStatusService.getFailoverizabilityTableCoverage()

    const rollout = evaluateFailoverizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.failoverizabilityStatusService.pingPostgres(),
      existingFailoverizabilityTableCount: failoverizabilityTableCoverage.existingFailoverizabilityTableCount,
      workspaceUsageLimitsTableExists: failoverizabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: failoverizabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: failoverizabilityTableCoverage.billingRecordsTableExists,
    })

    return failoverizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceFailoverizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageFailoverizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.failoverizabilityStatusService.getWorkspaceFailoverizabilityInventory(
        workspaceId,
      )
    const records = buildFailoverizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.failoverizabilityStatusService.pingPostgres()
    const stats = buildFailoverizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return failoverizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveFailoverizabilityAdminActions(),
      guidance: getFailoverizabilityAdminGuidance({ stats }),
    })
  }

  async executeFailoverizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_failoverizability_summary'
    },
  ) {
    this.assertCanManageFailoverizability(authContext)

    const payload = failoverizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_failoverizability_summary': {
        const summary = await this.getWorkspaceFailoverizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return failoverizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed failoverizability summary with ${summary.stats.failoverizabilityPercent}% workspace limit failoverizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageFailoverizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production failoverizability tools.',
    })
  }
}

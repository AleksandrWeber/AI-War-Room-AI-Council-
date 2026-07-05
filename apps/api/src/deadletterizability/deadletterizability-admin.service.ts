import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDeadletterizabilityRolloutGuidance,
  deadletterizabilityAdminActionRequestSchema,
  deadletterizabilityAdminActionResponseSchema,
  deadletterizabilityAdminSummaryResponseSchema,
  deadletterizabilityCapabilitiesResponseSchema,
  deadletterizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDeadletterizabilityAdminRecords,
  buildDeadletterizabilityAdminStats,
  getDeadletterizabilityAdminGuidance,
  resolveDeadletterizabilityAdminActions,
} from './deadletterizability-admin.helpers.js'
import { evaluateDeadletterizabilityRollout } from './deadletterizability-rollout.helpers.js'
import { DeadletterizabilityStatusService } from './deadletterizability-status.service.js'

@Injectable()
export class DeadletterizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly deadletterizabilityStatusService: DeadletterizabilityStatusService,
  ) {}

  getCapabilities() {
    return deadletterizabilityCapabilitiesResponseSchema.parse({
      supportsDeadletterizabilityRollout: true,
      supportsDeadletterizabilityAdminTools: true,
      supportsWorkspaceLimitDeadletterizabilitySignals: true,
      supportsUsageEventDeadletterizabilitySignals: true,
      guidance: getDeadletterizabilityRolloutGuidance(),
    })
  }

  async getDeadletterizabilityRollout() {
    const deadletterizabilityTableCoverage =
      await this.deadletterizabilityStatusService.getDeadletterizabilityTableCoverage()

    const rollout = evaluateDeadletterizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.deadletterizabilityStatusService.pingPostgres(),
      existingDeadletterizabilityTableCount: deadletterizabilityTableCoverage.existingDeadletterizabilityTableCount,
      workspaceUsageLimitsTableExists: deadletterizabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: deadletterizabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: deadletterizabilityTableCoverage.billingRecordsTableExists,
    })

    return deadletterizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDeadletterizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDeadletterizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.deadletterizabilityStatusService.getWorkspaceDeadletterizabilityInventory(
        workspaceId,
      )
    const records = buildDeadletterizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.deadletterizabilityStatusService.pingPostgres()
    const stats = buildDeadletterizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return deadletterizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDeadletterizabilityAdminActions(),
      guidance: getDeadletterizabilityAdminGuidance({ stats }),
    })
  }

  async executeDeadletterizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_deadletterizability_summary'
    },
  ) {
    this.assertCanManageDeadletterizability(authContext)

    const payload = deadletterizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_deadletterizability_summary': {
        const summary = await this.getWorkspaceDeadletterizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return deadletterizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed deadletterizability summary with ${summary.stats.deadletterizabilityPercent}% workspace limit deadletterizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDeadletterizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production deadletterizability tools.',
    })
  }
}

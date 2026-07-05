import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getHeuristizabilityRolloutGuidance,
  heuristizabilityAdminActionRequestSchema,
  heuristizabilityAdminActionResponseSchema,
  heuristizabilityAdminSummaryResponseSchema,
  heuristizabilityCapabilitiesResponseSchema,
  heuristizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildHeuristizabilityAdminRecords,
  buildHeuristizabilityAdminStats,
  getHeuristizabilityAdminGuidance,
  resolveHeuristizabilityAdminActions,
} from './heuristizability-admin.helpers.js'
import { evaluateHeuristizabilityRollout } from './heuristizability-rollout.helpers.js'
import { HeuristizabilityStatusService } from './heuristizability-status.service.js'

@Injectable()
export class HeuristizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly heuristizabilityStatusService: HeuristizabilityStatusService,
  ) {}

  getCapabilities() {
    return heuristizabilityCapabilitiesResponseSchema.parse({
      supportsHeuristizabilityRollout: true,
      supportsHeuristizabilityAdminTools: true,
      supportsWorkspaceLimitHeuristizabilitySignals: true,
      supportsUsageEventHeuristizabilitySignals: true,
      guidance: getHeuristizabilityRolloutGuidance(),
    })
  }

  async getHeuristizabilityRollout() {
    const heuristizabilityTableCoverage =
      await this.heuristizabilityStatusService.getHeuristizabilityTableCoverage()

    const rollout = evaluateHeuristizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.heuristizabilityStatusService.pingPostgres(),
      existingHeuristizabilityTableCount: heuristizabilityTableCoverage.existingHeuristizabilityTableCount,
      workspaceUsageLimitsTableExists: heuristizabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: heuristizabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: heuristizabilityTableCoverage.billingRecordsTableExists,
    })

    return heuristizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceHeuristizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageHeuristizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.heuristizabilityStatusService.getWorkspaceHeuristizabilityInventory(
        workspaceId,
      )
    const records = buildHeuristizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.heuristizabilityStatusService.pingPostgres()
    const stats = buildHeuristizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return heuristizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveHeuristizabilityAdminActions(),
      guidance: getHeuristizabilityAdminGuidance({ stats }),
    })
  }

  async executeHeuristizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_heuristizability_summary'
    },
  ) {
    this.assertCanManageHeuristizability(authContext)

    const payload = heuristizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_heuristizability_summary': {
        const summary = await this.getWorkspaceHeuristizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return heuristizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed heuristizability summary with ${summary.stats.heuristizabilityPercent}% workspace limit heuristizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageHeuristizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production heuristizability tools.',
    })
  }
}

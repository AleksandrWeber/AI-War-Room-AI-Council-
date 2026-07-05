import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getBluegreenizabilityRolloutGuidance,
  bluegreenizabilityAdminActionRequestSchema,
  bluegreenizabilityAdminActionResponseSchema,
  bluegreenizabilityAdminSummaryResponseSchema,
  bluegreenizabilityCapabilitiesResponseSchema,
  bluegreenizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildBluegreenizabilityAdminRecords,
  buildBluegreenizabilityAdminStats,
  getBluegreenizabilityAdminGuidance,
  resolveBluegreenizabilityAdminActions,
} from './bluegreenizability-admin.helpers.js'
import { evaluateBluegreenizabilityRollout } from './bluegreenizability-rollout.helpers.js'
import { BluegreenizabilityStatusService } from './bluegreenizability-status.service.js'

@Injectable()
export class BluegreenizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly bluegreenizabilityStatusService: BluegreenizabilityStatusService,
  ) {}

  getCapabilities() {
    return bluegreenizabilityCapabilitiesResponseSchema.parse({
      supportsBluegreenizabilityRollout: true,
      supportsBluegreenizabilityAdminTools: true,
      supportsWorkspaceLimitBluegreenizabilitySignals: true,
      supportsUsageEventBluegreenizabilitySignals: true,
      guidance: getBluegreenizabilityRolloutGuidance(),
    })
  }

  async getBluegreenizabilityRollout() {
    const bluegreenizabilityTableCoverage =
      await this.bluegreenizabilityStatusService.getBluegreenizabilityTableCoverage()

    const rollout = evaluateBluegreenizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.bluegreenizabilityStatusService.pingPostgres(),
      existingBluegreenizabilityTableCount: bluegreenizabilityTableCoverage.existingBluegreenizabilityTableCount,
      workspaceUsageLimitsTableExists: bluegreenizabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: bluegreenizabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: bluegreenizabilityTableCoverage.billingRecordsTableExists,
    })

    return bluegreenizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceBluegreenizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageBluegreenizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.bluegreenizabilityStatusService.getWorkspaceBluegreenizabilityInventory(
        workspaceId,
      )
    const records = buildBluegreenizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.bluegreenizabilityStatusService.pingPostgres()
    const stats = buildBluegreenizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return bluegreenizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveBluegreenizabilityAdminActions(),
      guidance: getBluegreenizabilityAdminGuidance({ stats }),
    })
  }

  async executeBluegreenizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_bluegreenizability_summary'
    },
  ) {
    this.assertCanManageBluegreenizability(authContext)

    const payload = bluegreenizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_bluegreenizability_summary': {
        const summary = await this.getWorkspaceBluegreenizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return bluegreenizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed bluegreenizability summary with ${summary.stats.bluegreenizabilityPercent}% workspace limit bluegreenizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageBluegreenizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production bluegreenizability tools.',
    })
  }
}

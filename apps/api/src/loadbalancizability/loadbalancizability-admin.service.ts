import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getLoadbalancizabilityRolloutGuidance,
  loadbalancizabilityAdminActionRequestSchema,
  loadbalancizabilityAdminActionResponseSchema,
  loadbalancizabilityAdminSummaryResponseSchema,
  loadbalancizabilityCapabilitiesResponseSchema,
  loadbalancizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildLoadbalancizabilityAdminRecords,
  buildLoadbalancizabilityAdminStats,
  getLoadbalancizabilityAdminGuidance,
  resolveLoadbalancizabilityAdminActions,
} from './loadbalancizability-admin.helpers.js'
import { evaluateLoadbalancizabilityRollout } from './loadbalancizability-rollout.helpers.js'
import { LoadbalancizabilityStatusService } from './loadbalancizability-status.service.js'

@Injectable()
export class LoadbalancizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly loadbalancizabilityStatusService: LoadbalancizabilityStatusService,
  ) {}

  getCapabilities() {
    return loadbalancizabilityCapabilitiesResponseSchema.parse({
      supportsLoadbalancizabilityRollout: true,
      supportsLoadbalancizabilityAdminTools: true,
      supportsWorkspaceLimitLoadbalancizabilitySignals: true,
      supportsUsageEventLoadbalancizabilitySignals: true,
      guidance: getLoadbalancizabilityRolloutGuidance(),
    })
  }

  async getLoadbalancizabilityRollout() {
    const loadbalancizabilityTableCoverage =
      await this.loadbalancizabilityStatusService.getLoadbalancizabilityTableCoverage()

    const rollout = evaluateLoadbalancizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.loadbalancizabilityStatusService.pingPostgres(),
      existingLoadbalancizabilityTableCount: loadbalancizabilityTableCoverage.existingLoadbalancizabilityTableCount,
      workspaceUsageLimitsTableExists: loadbalancizabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: loadbalancizabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: loadbalancizabilityTableCoverage.billingRecordsTableExists,
    })

    return loadbalancizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceLoadbalancizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageLoadbalancizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.loadbalancizabilityStatusService.getWorkspaceLoadbalancizabilityInventory(
        workspaceId,
      )
    const records = buildLoadbalancizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.loadbalancizabilityStatusService.pingPostgres()
    const stats = buildLoadbalancizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return loadbalancizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveLoadbalancizabilityAdminActions(),
      guidance: getLoadbalancizabilityAdminGuidance({ stats }),
    })
  }

  async executeLoadbalancizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_loadbalancizability_summary'
    },
  ) {
    this.assertCanManageLoadbalancizability(authContext)

    const payload = loadbalancizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_loadbalancizability_summary': {
        const summary = await this.getWorkspaceLoadbalancizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return loadbalancizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed loadbalancizability summary with ${summary.stats.loadbalancizabilityPercent}% workspace limit loadbalancizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageLoadbalancizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production loadbalancizability tools.',
    })
  }
}

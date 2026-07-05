import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCollectizabilityRolloutGuidance,
  collectizabilityAdminActionRequestSchema,
  collectizabilityAdminActionResponseSchema,
  collectizabilityAdminSummaryResponseSchema,
  collectizabilityCapabilitiesResponseSchema,
  collectizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCollectizabilityAdminRecords,
  buildCollectizabilityAdminStats,
  getCollectizabilityAdminGuidance,
  resolveCollectizabilityAdminActions,
} from './collectizability-admin.helpers.js'
import { evaluateCollectizabilityRollout } from './collectizability-rollout.helpers.js'
import { CollectizabilityStatusService } from './collectizability-status.service.js'

@Injectable()
export class CollectizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly collectizabilityStatusService: CollectizabilityStatusService,
  ) {}

  getCapabilities() {
    return collectizabilityCapabilitiesResponseSchema.parse({
      supportsCollectizabilityRollout: true,
      supportsCollectizabilityAdminTools: true,
      supportsWorkspaceLimitCollectizabilitySignals: true,
      supportsUsageEventCollectizabilitySignals: true,
      guidance: getCollectizabilityRolloutGuidance(),
    })
  }

  async getCollectizabilityRollout() {
    const collectizabilityTableCoverage =
      await this.collectizabilityStatusService.getCollectizabilityTableCoverage()

    const rollout = evaluateCollectizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.collectizabilityStatusService.pingPostgres(),
      existingCollectizabilityTableCount: collectizabilityTableCoverage.existingCollectizabilityTableCount,
      workspaceUsageLimitsTableExists: collectizabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: collectizabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: collectizabilityTableCoverage.billingRecordsTableExists,
    })

    return collectizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCollectizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCollectizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.collectizabilityStatusService.getWorkspaceCollectizabilityInventory(
        workspaceId,
      )
    const records = buildCollectizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.collectizabilityStatusService.pingPostgres()
    const stats = buildCollectizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return collectizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCollectizabilityAdminActions(),
      guidance: getCollectizabilityAdminGuidance({ stats }),
    })
  }

  async executeCollectizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_collectizability_summary'
    },
  ) {
    this.assertCanManageCollectizability(authContext)

    const payload = collectizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_collectizability_summary': {
        const summary = await this.getWorkspaceCollectizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return collectizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed collectizability summary with ${summary.stats.collectizabilityPercent}% workspace limit collectizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCollectizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production collectizability tools.',
    })
  }
}

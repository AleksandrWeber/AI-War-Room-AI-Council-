import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getReduceizabilityRolloutGuidance,
  reduceizabilityAdminActionRequestSchema,
  reduceizabilityAdminActionResponseSchema,
  reduceizabilityAdminSummaryResponseSchema,
  reduceizabilityCapabilitiesResponseSchema,
  reduceizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildReduceizabilityAdminRecords,
  buildReduceizabilityAdminStats,
  getReduceizabilityAdminGuidance,
  resolveReduceizabilityAdminActions,
} from './reduceizability-admin.helpers.js'
import { evaluateReduceizabilityRollout } from './reduceizability-rollout.helpers.js'
import { ReduceizabilityStatusService } from './reduceizability-status.service.js'

@Injectable()
export class ReduceizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly reduceizabilityStatusService: ReduceizabilityStatusService,
  ) {}

  getCapabilities() {
    return reduceizabilityCapabilitiesResponseSchema.parse({
      supportsReduceizabilityRollout: true,
      supportsReduceizabilityAdminTools: true,
      supportsWorkspaceLimitReduceizabilitySignals: true,
      supportsUsageEventReduceizabilitySignals: true,
      guidance: getReduceizabilityRolloutGuidance(),
    })
  }

  async getReduceizabilityRollout() {
    const reduceizabilityTableCoverage =
      await this.reduceizabilityStatusService.getReduceizabilityTableCoverage()

    const rollout = evaluateReduceizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.reduceizabilityStatusService.pingPostgres(),
      existingReduceizabilityTableCount: reduceizabilityTableCoverage.existingReduceizabilityTableCount,
      workspaceUsageLimitsTableExists: reduceizabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: reduceizabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: reduceizabilityTableCoverage.billingRecordsTableExists,
    })

    return reduceizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceReduceizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageReduceizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.reduceizabilityStatusService.getWorkspaceReduceizabilityInventory(
        workspaceId,
      )
    const records = buildReduceizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.reduceizabilityStatusService.pingPostgres()
    const stats = buildReduceizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return reduceizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveReduceizabilityAdminActions(),
      guidance: getReduceizabilityAdminGuidance({ stats }),
    })
  }

  async executeReduceizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_reduceizability_summary'
    },
  ) {
    this.assertCanManageReduceizability(authContext)

    const payload = reduceizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_reduceizability_summary': {
        const summary = await this.getWorkspaceReduceizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return reduceizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed reduceizability summary with ${summary.stats.reduceizabilityPercent}% workspace limit reduceizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageReduceizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production reduceizability tools.',
    })
  }
}

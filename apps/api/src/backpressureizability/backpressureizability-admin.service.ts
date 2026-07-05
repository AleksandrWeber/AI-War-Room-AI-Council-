import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getBackpressureizabilityRolloutGuidance,
  backpressureizabilityAdminActionRequestSchema,
  backpressureizabilityAdminActionResponseSchema,
  backpressureizabilityAdminSummaryResponseSchema,
  backpressureizabilityCapabilitiesResponseSchema,
  backpressureizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildBackpressureizabilityAdminRecords,
  buildBackpressureizabilityAdminStats,
  getBackpressureizabilityAdminGuidance,
  resolveBackpressureizabilityAdminActions,
} from './backpressureizability-admin.helpers.js'
import { evaluateBackpressureizabilityRollout } from './backpressureizability-rollout.helpers.js'
import { BackpressureizabilityStatusService } from './backpressureizability-status.service.js'

@Injectable()
export class BackpressureizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly backpressureizabilityStatusService: BackpressureizabilityStatusService,
  ) {}

  getCapabilities() {
    return backpressureizabilityCapabilitiesResponseSchema.parse({
      supportsBackpressureizabilityRollout: true,
      supportsBackpressureizabilityAdminTools: true,
      supportsWorkspaceLimitBackpressureizabilitySignals: true,
      supportsUsageEventBackpressureizabilitySignals: true,
      guidance: getBackpressureizabilityRolloutGuidance(),
    })
  }

  async getBackpressureizabilityRollout() {
    const backpressureizabilityTableCoverage =
      await this.backpressureizabilityStatusService.getBackpressureizabilityTableCoverage()

    const rollout = evaluateBackpressureizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.backpressureizabilityStatusService.pingPostgres(),
      existingBackpressureizabilityTableCount: backpressureizabilityTableCoverage.existingBackpressureizabilityTableCount,
      workspaceUsageLimitsTableExists: backpressureizabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: backpressureizabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: backpressureizabilityTableCoverage.billingRecordsTableExists,
    })

    return backpressureizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceBackpressureizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageBackpressureizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.backpressureizabilityStatusService.getWorkspaceBackpressureizabilityInventory(
        workspaceId,
      )
    const records = buildBackpressureizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.backpressureizabilityStatusService.pingPostgres()
    const stats = buildBackpressureizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return backpressureizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveBackpressureizabilityAdminActions(),
      guidance: getBackpressureizabilityAdminGuidance({ stats }),
    })
  }

  async executeBackpressureizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_backpressureizability_summary'
    },
  ) {
    this.assertCanManageBackpressureizability(authContext)

    const payload = backpressureizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_backpressureizability_summary': {
        const summary = await this.getWorkspaceBackpressureizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return backpressureizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed backpressureizability summary with ${summary.stats.backpressureizabilityPercent}% workspace limit backpressureizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageBackpressureizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production backpressureizability tools.',
    })
  }
}

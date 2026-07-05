import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRedundizabilityRolloutGuidance,
  redundizabilityAdminActionRequestSchema,
  redundizabilityAdminActionResponseSchema,
  redundizabilityAdminSummaryResponseSchema,
  redundizabilityCapabilitiesResponseSchema,
  redundizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRedundizabilityAdminRecords,
  buildRedundizabilityAdminStats,
  getRedundizabilityAdminGuidance,
  resolveRedundizabilityAdminActions,
} from './redundizability-admin.helpers.js'
import { evaluateRedundizabilityRollout } from './redundizability-rollout.helpers.js'
import { RedundizabilityStatusService } from './redundizability-status.service.js'

@Injectable()
export class RedundizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly redundizabilityStatusService: RedundizabilityStatusService,
  ) {}

  getCapabilities() {
    return redundizabilityCapabilitiesResponseSchema.parse({
      supportsRedundizabilityRollout: true,
      supportsRedundizabilityAdminTools: true,
      supportsMeterUsageRedundizabilitySignals: true,
      supportsUsageEventRedundizabilitySignals: true,
      guidance: getRedundizabilityRolloutGuidance(),
    })
  }

  async getRedundizabilityRollout() {
    const redundizabilityTableCoverage =
      await this.redundizabilityStatusService.getRedundizabilityTableCoverage()

    const rollout = evaluateRedundizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.redundizabilityStatusService.pingPostgres(),
      existingRedundizabilityTableCount: redundizabilityTableCoverage.existingRedundizabilityTableCount,
      billingMeterUsageReportsTableExists: redundizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: redundizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: redundizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return redundizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRedundizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRedundizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.redundizabilityStatusService.getWorkspaceRedundizabilityInventory(
        workspaceId,
      )
    const records = buildRedundizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.redundizabilityStatusService.pingPostgres()
    const stats = buildRedundizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return redundizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRedundizabilityAdminActions(),
      guidance: getRedundizabilityAdminGuidance({ stats }),
    })
  }

  async executeRedundizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_redundizability_summary'
    },
  ) {
    this.assertCanManageRedundizability(authContext)

    const payload = redundizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_redundizability_summary': {
        const summary = await this.getWorkspaceRedundizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return redundizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed redundizability summary with ${summary.stats.redundizabilityPercent}% meter usage redundizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRedundizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production redundizability tools.',
    })
  }
}

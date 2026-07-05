import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getBenchmarkizabilityRolloutGuidance,
  benchmarkizabilityAdminActionRequestSchema,
  benchmarkizabilityAdminActionResponseSchema,
  benchmarkizabilityAdminSummaryResponseSchema,
  benchmarkizabilityCapabilitiesResponseSchema,
  benchmarkizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildBenchmarkizabilityAdminRecords,
  buildBenchmarkizabilityAdminStats,
  getBenchmarkizabilityAdminGuidance,
  resolveBenchmarkizabilityAdminActions,
} from './benchmarkizability-admin.helpers.js'
import { evaluateBenchmarkizabilityRollout } from './benchmarkizability-rollout.helpers.js'
import { BenchmarkizabilityStatusService } from './benchmarkizability-status.service.js'

@Injectable()
export class BenchmarkizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly benchmarkizabilityStatusService: BenchmarkizabilityStatusService,
  ) {}

  getCapabilities() {
    return benchmarkizabilityCapabilitiesResponseSchema.parse({
      supportsBenchmarkizabilityRollout: true,
      supportsBenchmarkizabilityAdminTools: true,
      supportsMembershipBenchmarkizabilitySignals: true,
      supportsUsageEventBenchmarkizabilitySignals: true,
      guidance: getBenchmarkizabilityRolloutGuidance(),
    })
  }

  async getBenchmarkizabilityRollout() {
    const benchmarkizabilityTableCoverage =
      await this.benchmarkizabilityStatusService.getBenchmarkizabilityTableCoverage()

    const rollout = evaluateBenchmarkizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.benchmarkizabilityStatusService.pingPostgres(),
      existingBenchmarkizabilityTableCount: benchmarkizabilityTableCoverage.existingBenchmarkizabilityTableCount,
      workspaceMembershipsTableExists: benchmarkizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: benchmarkizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: benchmarkizabilityTableCoverage.billingNotificationsTableExists,
    })

    return benchmarkizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceBenchmarkizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageBenchmarkizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.benchmarkizabilityStatusService.getWorkspaceBenchmarkizabilityInventory(
        workspaceId,
      )
    const records = buildBenchmarkizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.benchmarkizabilityStatusService.pingPostgres()
    const stats = buildBenchmarkizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return benchmarkizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveBenchmarkizabilityAdminActions(),
      guidance: getBenchmarkizabilityAdminGuidance({ stats }),
    })
  }

  async executeBenchmarkizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_benchmarkizability_summary'
    },
  ) {
    this.assertCanManageBenchmarkizability(authContext)

    const payload = benchmarkizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_benchmarkizability_summary': {
        const summary = await this.getWorkspaceBenchmarkizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return benchmarkizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed benchmarkizability summary with ${summary.stats.benchmarkizabilityPercent}% membership benchmarkizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageBenchmarkizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production benchmarkizability tools.',
    })
  }
}

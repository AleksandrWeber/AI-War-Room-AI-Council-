import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getPerformanceRolloutGuidance,
  performanceAdminActionRequestSchema,
  performanceAdminActionResponseSchema,
  performanceAdminSummaryResponseSchema,
  performanceCapabilitiesResponseSchema,
  performanceRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { ObservabilityService } from '../observability/observability.service.js'
import {
  buildPerformanceAdminRecords,
  buildPerformanceAdminStats,
  getPerformanceAdminGuidance,
  rankSlowestPipelinePhases,
  resolvePerformanceAdminActions,
} from './performance-admin.helpers.js'
import { evaluatePerformanceRollout } from './performance-rollout.helpers.js'
import { PerformanceStatusService } from './performance-status.service.js'

@Injectable()
export class PerformanceAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly performanceStatusService: PerformanceStatusService,
    private readonly observabilityService: ObservabilityService,
  ) {}

  getCapabilities() {
    return performanceCapabilitiesResponseSchema.parse({
      supportsPerformanceRollout: true,
      supportsPerformanceAdminTools: true,
      supportsPipelineLatencySignals: true,
      supportsTracingLatencySignals: true,
      guidance: getPerformanceRolloutGuidance(),
    })
  }

  async getPerformanceRollout() {
    const performanceTableCoverage =
      await this.performanceStatusService.getPerformanceTableCoverage()
    const rollout = evaluatePerformanceRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.performanceStatusService.pingPostgres(),
      existingPerformanceTableCount:
        performanceTableCoverage.existingPerformanceTableCount,
      observabilityBufferCapacity:
        this.observabilityService.getRecentEventBufferCapacity(),
      modelHealthEventTableExists:
        performanceTableCoverage.modelHealthEventTableExists,
      tracingEnabled: true,
    })

    return performanceRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspacePerformanceAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManagePerformance(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const latencyMetrics = this.getWorkspaceLatencyMetrics(workspaceId)
    const inventoryItems =
      await this.performanceStatusService.getWorkspacePerformanceInventory(
        workspaceId,
        latencyMetrics.latencyEventCount,
      )
    const records = buildPerformanceAdminRecords(inventoryItems)
    const postgresConnectivity =
      await this.performanceStatusService.pingPostgres()
    const stats = buildPerformanceAdminStats({
      records,
      postgresConnectivity,
      pipelineEventCount: latencyMetrics.pipelineEventCount,
      latencyEventCount: latencyMetrics.latencyEventCount,
      averageLatencyMs: latencyMetrics.averageLatencyMs,
      slowestPipelinePhases: latencyMetrics.slowestPipelinePhases,
    })

    return performanceAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolvePerformanceAdminActions(),
      guidance: getPerformanceAdminGuidance({ stats }),
    })
  }

  async executePerformanceAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_performance_summary'
    },
  ) {
    this.assertCanManagePerformance(authContext)

    const payload = performanceAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_performance_summary': {
        const summary = await this.getWorkspacePerformanceAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return performanceAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed performance summary with ${summary.stats.averageLatencyMs}ms average latency and ${summary.stats.latencySignalPercent}% latency signal coverage across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private getWorkspaceLatencyMetrics(workspaceId: string) {
    const workspaceEvents =
      this.observabilityService.getRecentEventsForWorkspace(workspaceId)
    const latencyEvents = workspaceEvents.filter(
      (event) => typeof event.attributes.durationMs === 'number',
    )
    const averageLatencyMs =
      latencyEvents.length === 0
        ? 0
        : Math.round(
            latencyEvents.reduce(
              (total, event) => total + Number(event.attributes.durationMs),
              0,
            ) / latencyEvents.length,
          )

    return {
      pipelineEventCount: workspaceEvents.length,
      latencyEventCount: latencyEvents.length,
      averageLatencyMs,
      slowestPipelinePhases: rankSlowestPipelinePhases(workspaceEvents),
    }
  }

  private assertCanManagePerformance(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production performance tools.',
    })
  }
}

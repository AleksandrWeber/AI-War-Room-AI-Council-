import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getObservabilityRolloutGuidance,
  observabilityAdminActionRequestSchema,
  observabilityAdminActionResponseSchema,
  observabilityAdminSummaryResponseSchema,
  observabilityCapabilitiesResponseSchema,
  observabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { StreamEventBufferService } from '../persistence/stream-event-buffer.service.js'
import { isTerminalPipelineStreamEvent } from '../runs/pipeline-stream-event.js'
import { TemporalHealthService } from '../temporal/temporal-health.service.js'
import { getTemporalWorkerConfig } from '../temporal/temporal-worker.config.js'
import {
  buildObservabilityAdminStats,
  buildObservabilityAlerts,
  getObservabilityAdminGuidance,
  resolveObservabilityAdminActions,
  toObservabilityAdminEvents,
} from './observability-admin.helpers.js'
import { evaluateObservabilityRollout } from './observability-rollout.helpers.js'
import { ObservabilityService } from './observability.service.js'

@Injectable()
export class ObservabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly observabilityService: ObservabilityService,
    private readonly streamEventBufferService: StreamEventBufferService,
    private readonly temporalHealthService: TemporalHealthService,
  ) {}

  getCapabilities() {
    return observabilityCapabilitiesResponseSchema.parse({
      supportsObservabilityRollout: true,
      supportsObservabilityAdminTools: true,
      structuredLoggingEnabled: true,
      tracingEnabled: true,
      recentEventBufferCapacity:
        this.observabilityService.getRecentEventBufferCapacity(),
      guidance: getObservabilityRolloutGuidance(),
    })
  }

  getObservabilityRollout() {
    const rollout = evaluateObservabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      structuredLoggingEnabled: true,
      tracingEnabled: true,
      recentEventBufferCapacity:
        this.observabilityService.getRecentEventBufferCapacity(),
      supportedPipelineEvents:
        this.observabilityService.getSupportedPipelineEvents(),
    })

    return observabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceObservabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageObservability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const recentEvents =
      this.observabilityService.getRecentEventsForWorkspace(workspaceId)
    const events = toObservabilityAdminEvents(recentEvents)
    const stats = buildObservabilityAdminStats(events)
    const availableActions = resolveObservabilityAdminActions({ stats })
    const temporalConfig = getTemporalWorkerConfig(this.configService)
    const temporalHealth = temporalConfig.enabled
      ? await this.temporalHealthService.getRuntimeHealth()
      : null
    const streamSummaries =
      await this.streamEventBufferService.listWorkspaceBufferedStreams(
        workspaceId,
      )
    const alerts = buildObservabilityAlerts({
      workspaceId,
      temporalEnabled: temporalConfig.enabled,
      temporalHealthy: temporalHealth ? temporalHealth.status === 'healthy' : true,
      temporalGuidance: temporalHealth?.guidance,
      streamSummaries: streamSummaries.map((summary) => ({
        runId: summary.runId,
        lastEventAt: summary.lastEvent?.timestamp,
        terminal: summary.lastEvent
          ? isTerminalPipelineStreamEvent(summary.lastEvent)
          : false,
      })),
      recentEvents,
    })

    return observabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      events,
      stats,
      alerts,
      availableActions,
      guidance: getObservabilityAdminGuidance({ stats, alerts }),
    })
  }

  async executeObservabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_event_summary' | 'clear_observability_buffer'
    },
  ) {
    this.assertCanManageObservability(authContext)

    const payload = observabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_event_summary': {
        const summary = await this.getWorkspaceObservabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return observabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed observability summary with ${summary.stats.totalEvents} recent workspace event(s) and ${summary.alerts.length} alert(s).`,
          stats: summary.stats,
        })
      }
      case 'clear_observability_buffer': {
        this.observabilityService.clearRecentEvents()
        const summary = await this.getWorkspaceObservabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return observabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: 'Cleared the local observability event buffer.',
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageObservability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage observability tools.',
    })
  }
}

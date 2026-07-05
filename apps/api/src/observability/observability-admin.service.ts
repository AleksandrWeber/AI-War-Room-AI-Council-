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
import {
  buildObservabilityAdminStats,
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

  getWorkspaceObservabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageObservability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const events = toObservabilityAdminEvents(
      this.observabilityService.getRecentEventsForWorkspace(workspaceId),
    )
    const stats = buildObservabilityAdminStats(events)
    const availableActions = resolveObservabilityAdminActions({ stats })

    return observabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      events,
      stats,
      availableActions,
      guidance: getObservabilityAdminGuidance({ stats }),
    })
  }

  executeObservabilityAdminAction(
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
        const summary = this.getWorkspaceObservabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return observabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed observability summary with ${summary.stats.totalEvents} recent workspace event(s).`,
          stats: summary.stats,
        })
      }
      case 'clear_observability_buffer': {
        this.observabilityService.clearRecentEvents()
        const summary = this.getWorkspaceObservabilityAdminSummary(
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

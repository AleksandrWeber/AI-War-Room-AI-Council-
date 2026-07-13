import { Injectable, Logger } from '@nestjs/common'
import { SpanStatusCode, trace, type Attributes } from '@opentelemetry/api'

type ObservabilityLevel = 'info' | 'warn' | 'error'

export const RECENT_EVENT_BUFFER_CAPACITY = 200

export const supportedPipelineObservabilityEvents = [
  'pipeline_phase_completed',
  'pipeline_quota_check_completed',
  'pipeline_cost_signal',
  'shield_scan_completed',
  'shield_scan_classified',
  'shield_abuse_signal',
  'shield_override_recorded',
  'llm_call_completed',
  'llm_provider_failure',
  'llm_validation_failure',
  'llm_fallback_used',
  'model_router_selection',
  'model_router_model_degraded',
  'model_router_model_recovered',
  'research_context_retrieved',
  'temporal_workflow_start_completed',
  'temporal_workflow_status_checked',
  'temporal_runtime_health_checked',
] as const

export type ObservabilityEvent = {
  eventName: string
  level: ObservabilityLevel
  timestamp: string
  attributes: Record<string, string | number | boolean | null>
}

@Injectable()
export class ObservabilityService {
  private readonly logger = new Logger(ObservabilityService.name)
  private readonly tracer = trace.getTracer('ai-war-room-api')
  private readonly recentEvents: ObservabilityEvent[] = []

  record(
    eventName: string,
    attributes: Record<string, string | number | boolean | null>,
    level: ObservabilityLevel = 'info',
  ) {
    const event: ObservabilityEvent = {
      eventName,
      level,
      timestamp: new Date().toISOString(),
      attributes,
    }

    this.recentEvents.push(event)
    this.recentEvents.splice(
      0,
      Math.max(0, this.recentEvents.length - RECENT_EVENT_BUFFER_CAPACITY),
    )
    this.write(event)

    return event
  }

  async measure<T>(
    eventName: string,
    attributes: Record<string, string | number | boolean | null>,
    operation: () => Promise<T>,
  ): Promise<T> {
    return this.tracer.startActiveSpan(eventName, async (span) => {
      const startedAt = Date.now()
      span.setAttributes(this.toSpanAttributes(attributes))

      try {
        const result = await operation()
        const durationMs = Date.now() - startedAt
        span.setAttributes({
          durationMs,
          success: true,
        })
        span.setStatus({ code: SpanStatusCode.OK })
        this.record(eventName, {
          ...attributes,
          durationMs,
          success: true,
        })

        return result
      } catch (error) {
        const durationMs = Date.now() - startedAt
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown operation failure.'
        span.setAttributes({
          durationMs,
          success: false,
          errorMessage,
        })
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: errorMessage,
        })
        this.record(
          eventName,
          {
            ...attributes,
            durationMs,
            success: false,
            errorMessage,
          },
          'error',
        )

        throw error
      } finally {
        span.end()
      }
    })
  }

  getRecentEvents() {
    return [...this.recentEvents]
  }

  getRecentEventsForWorkspace(workspaceId: string) {
    return this.recentEvents.filter(
      (event) => event.attributes.workspaceId === workspaceId,
    )
  }

  getRecentEventBufferCapacity() {
    return RECENT_EVENT_BUFFER_CAPACITY
  }

  getSupportedPipelineEvents() {
    return [...supportedPipelineObservabilityEvents]
  }

  clearRecentEvents() {
    this.recentEvents.length = 0
  }

  private write(event: ObservabilityEvent) {
    const payload = JSON.stringify(event)

    if (event.level === 'error') {
      this.logger.error(payload)
      return
    }

    if (event.level === 'warn') {
      this.logger.warn(payload)
      return
    }

    this.logger.log(payload)
  }

  private toSpanAttributes(
    attributes: Record<string, string | number | boolean | null>,
  ): Attributes {
    return Object.fromEntries(
      Object.entries(attributes).filter((entry): entry is [string, string | number | boolean] => {
        return entry[1] !== null
      }),
    )
  }
}

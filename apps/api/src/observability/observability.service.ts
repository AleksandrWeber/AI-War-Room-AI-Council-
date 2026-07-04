import { Injectable, Logger } from '@nestjs/common'
import { SpanStatusCode, trace, type Attributes } from '@opentelemetry/api'

type ObservabilityLevel = 'info' | 'warn' | 'error'

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
    this.recentEvents.splice(0, Math.max(0, this.recentEvents.length - 200))
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

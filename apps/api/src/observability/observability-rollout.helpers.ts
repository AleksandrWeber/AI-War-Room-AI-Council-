import { criticalPipelineObservabilityEvents } from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'

export type ObservabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ObservabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ObservabilityRolloutCheck[]
  guidance: string
}

export type ObservabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  structuredLoggingEnabled: boolean
  tracingEnabled: boolean
  recentEventBufferCapacity: number
  supportedPipelineEvents: readonly string[]
}

export function evaluateObservabilityRollout(
  input: ObservabilityRolloutInput,
): ObservabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const missingEvents = criticalPipelineObservabilityEvents.filter(
    (eventName) => !input.supportedPipelineEvents.includes(eventName),
  )

  const checks: ObservabilityRolloutCheck[] = [
    {
      name: 'structured_logging',
      label: 'Structured logging',
      status: input.structuredLoggingEnabled ? 'pass' : 'fail',
      detail: input.structuredLoggingEnabled
        ? 'Structured JSON observability events are enabled.'
        : 'Structured logging is not configured.',
    },
    {
      name: 'tracing_spans',
      label: 'Tracing spans',
      status: input.tracingEnabled ? 'pass' : 'fail',
      detail: input.tracingEnabled
        ? 'OpenTelemetry tracing spans are enabled for pipeline phases.'
        : 'Tracing instrumentation is not configured.',
    },
    {
      name: 'recent_event_buffer',
      label: 'Recent event buffer',
      status: input.recentEventBufferCapacity >= 100 ? 'pass' : 'fail',
      detail:
        input.recentEventBufferCapacity >= 100
          ? `Recent event buffer retains up to ${input.recentEventBufferCapacity} events.`
          : 'Recent event buffer capacity is too small for production diagnostics.',
    },
    {
      name: 'pipeline_event_coverage',
      label: 'Pipeline event coverage',
      status: missingEvents.length === 0 ? 'pass' : 'fail',
      detail:
        missingEvents.length === 0
          ? `All ${criticalPipelineObservabilityEvents.length} critical pipeline events are instrumented.`
          : `Missing pipeline events: ${missingEvents.join(', ')}.`,
    },
    {
      name: 'production_buffer_capacity',
      label: 'Production buffer capacity',
      status:
        !isProduction || input.recentEventBufferCapacity >= 200 ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Production buffer capacity is only enforced in production.'
          : input.recentEventBufferCapacity >= 200
            ? 'Production observability buffer meets minimum capacity.'
            : 'Production observability rollout requires a buffer capacity of at least 200 events.',
    },
  ]

  const status = checks.every((check) => check.status === 'pass')
    ? 'ready'
    : 'not_ready'

  return {
    status,
    checks,
    guidance:
      status === 'ready'
        ? 'Observability rollout checks passed. Structured logging, tracing, and pipeline event coverage are ready for production.'
        : 'Observability rollout is not ready. Resolve failed checks before relying on production pipeline diagnostics.',
  }
}

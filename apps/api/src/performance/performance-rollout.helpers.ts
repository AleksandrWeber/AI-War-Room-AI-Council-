import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PERFORMANCE_TABLES = [
  'model_health_events',
  'usage_events',
  'runs',
] as const

export type PerformanceRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type PerformanceRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: PerformanceRolloutCheck[]
  guidance: string
}

export type PerformanceRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingPerformanceTableCount: number
  observabilityBufferCapacity: number
  modelHealthEventTableExists: boolean
  tracingEnabled: boolean
}

export function evaluatePerformanceRollout(
  input: PerformanceRolloutInput,
): PerformanceRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const performanceTableCoverageComplete =
    input.existingPerformanceTableCount === CRITICAL_PERFORMANCE_TABLES.length
  const observabilityBufferReady = input.observabilityBufferCapacity >= 100

  const checks: PerformanceRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL performance checks can reach the database.'
            : 'Production performance rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'performance_signal_table_coverage',
      label: 'Performance signal table coverage',
      status:
        performanceTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Performance signal table coverage is only enforced in production.'
          : performanceTableCoverageComplete
            ? `${input.existingPerformanceTableCount}/${CRITICAL_PERFORMANCE_TABLES.length} performance signal tables are present.`
            : `${input.existingPerformanceTableCount}/${CRITICAL_PERFORMANCE_TABLES.length} performance signal tables were found.`,
    },
    {
      name: 'observability_performance_buffer',
      label: 'Observability performance buffer',
      status: observabilityBufferReady ? 'pass' : 'fail',
      detail: observabilityBufferReady
        ? `Observability buffer capacity is ${input.observabilityBufferCapacity} recent event(s).`
        : 'Production performance rollout requires an observability buffer capacity of at least 100 events.',
    },
    {
      name: 'tracing_latency_signals',
      label: 'Tracing latency signals',
      status: input.tracingEnabled ? 'pass' : 'fail',
      detail: input.tracingEnabled
        ? 'OpenTelemetry tracing spans record pipeline latency signals.'
        : 'Production performance rollout requires tracing latency instrumentation.',
    },
    {
      name: 'latency_readiness_signal',
      label: 'Latency readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          performanceTableCoverageComplete &&
          observabilityBufferReady &&
          input.modelHealthEventTableExists &&
          input.tracingEnabled)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Latency readiness is only enforced in production.'
          : input.postgresConnectivity &&
              performanceTableCoverageComplete &&
              observabilityBufferReady &&
              input.modelHealthEventTableExists &&
              input.tracingEnabled
            ? 'Run outcomes, usage events, observability buffers, model health events, and tracing support latency readiness.'
            : 'Production performance rollout requires PostgreSQL connectivity, performance tables, observability buffers, model health events, and tracing signals.',
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
        ? 'Production performance rollout checks passed. Performance coverage and latency readiness signals are healthy.'
        : 'Production performance rollout is not ready. Resolve failed checks before relying on production performance tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_OPTIMIZATION_TABLES = [
  'model_health_events',
  'usage_events',
  'runs',
] as const

export type OptimizationRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type OptimizationRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: OptimizationRolloutCheck[]
  guidance: string
}

export type OptimizationRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingOptimizationTableCount: number
  modelHealthEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateOptimizationRollout(
  input: OptimizationRolloutInput,
): OptimizationRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const optimizationTableCoverageComplete =
    input.existingOptimizationTableCount ===
    CRITICAL_OPTIMIZATION_TABLES.length

  const checks: OptimizationRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL optimization checks can reach the database.'
            : 'Production optimization rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'optimization_signal_table_coverage',
      label: 'Optimization signal table coverage',
      status:
        optimizationTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Optimization signal table coverage is only enforced in production.'
          : optimizationTableCoverageComplete
            ? `${input.existingOptimizationTableCount}/${CRITICAL_OPTIMIZATION_TABLES.length} optimization signal tables are present.`
            : `${input.existingOptimizationTableCount}/${CRITICAL_OPTIMIZATION_TABLES.length} optimization signal tables were found.`,
    },
    {
      name: 'model_health_optimization',
      label: 'Model health optimization',
      status:
        input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health optimization is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health optimization signals.'
            : 'Production optimization rollout requires a model_health_events table.',
    },
    {
      name: 'usage_optimization',
      label: 'Usage optimization',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage optimization is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage optimization signals.'
            : 'Production optimization rollout requires a usage_events table.',
    },
    {
      name: 'performance_readiness_signal',
      label: 'Performance readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          optimizationTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Performance readiness is only enforced in production.'
          : input.postgresConnectivity &&
              optimizationTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.usageEventsTableExists
            ? 'Run outcomes, model health events, and usage telemetry support performance readiness.'
            : 'Production optimization rollout requires PostgreSQL connectivity, optimization tables, model health coverage, and usage optimization signals.',
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
        ? 'Production optimization rollout checks passed. Optimization coverage and performance readiness signals are healthy.'
        : 'Production optimization rollout is not ready. Resolve failed checks before relying on production optimization tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_EFFICIENCY_TABLES = [
  'usage_events',
  'workspace_usage_limits',
  'runs',
] as const

export type EfficiencyRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type EfficiencyRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: EfficiencyRolloutCheck[]
  guidance: string
}

export type EfficiencyRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingEfficiencyTableCount: number
  usageEventsTableExists: boolean
  usageLimitsTableExists: boolean
}

export function evaluateEfficiencyRollout(
  input: EfficiencyRolloutInput,
): EfficiencyRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const efficiencyTableCoverageComplete =
    input.existingEfficiencyTableCount === CRITICAL_EFFICIENCY_TABLES.length

  const checks: EfficiencyRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL efficiency checks can reach the database.'
            : 'Production efficiency rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'efficiency_signal_table_coverage',
      label: 'Efficiency signal table coverage',
      status: efficiencyTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Efficiency signal table coverage is only enforced in production.'
          : efficiencyTableCoverageComplete
            ? `${input.existingEfficiencyTableCount}/${CRITICAL_EFFICIENCY_TABLES.length} efficiency signal tables are present.`
            : `${input.existingEfficiencyTableCount}/${CRITICAL_EFFICIENCY_TABLES.length} efficiency signal tables were found.`,
    },
    {
      name: 'usage_telemetry_efficiency',
      label: 'Usage telemetry efficiency',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage telemetry efficiency is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage telemetry efficiency signals.'
            : 'Production efficiency rollout requires a usage_events table.',
    },
    {
      name: 'cost_limit_efficiency',
      label: 'Cost limit efficiency',
      status: input.usageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Cost limit efficiency is only enforced in production.'
          : input.usageLimitsTableExists
            ? 'workspace_usage_limits table is available for cost limit efficiency signals.'
            : 'Production efficiency rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'resource_readiness_signal',
      label: 'Resource readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          efficiencyTableCoverageComplete &&
          input.usageEventsTableExists &&
          input.usageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Resource readiness is only enforced in production.'
          : input.postgresConnectivity &&
              efficiencyTableCoverageComplete &&
              input.usageEventsTableExists &&
              input.usageLimitsTableExists
            ? 'Run outcomes, usage telemetry, and cost limits support resource readiness.'
            : 'Production efficiency rollout requires PostgreSQL connectivity, efficiency tables, usage telemetry, and cost limit coverage.',
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
        ? 'Production efficiency rollout checks passed. Efficiency coverage and resource readiness signals are healthy.'
        : 'Production efficiency rollout is not ready. Resolve failed checks before relying on production efficiency tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PARAMETRIZABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type ParametrizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ParametrizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ParametrizabilityRolloutCheck[]
  guidance: string
}

export type ParametrizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingParametrizabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateParametrizabilityRollout(
  input: ParametrizabilityRolloutInput,
): ParametrizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const parametrizabilityTableCoverageComplete =
    input.existingParametrizabilityTableCount === CRITICAL_PARAMETRIZABILITY_TABLES.length

  const checks: ParametrizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL parametrizability checks can reach the database.'
            : 'Production parametrizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'parametrizability_signal_table_coverage',
      label: 'Parametrizability signal table coverage',
      status: parametrizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Parametrizability signal table coverage is only enforced in production.'
          : parametrizabilityTableCoverageComplete
            ? `${input.existingParametrizabilityTableCount}/${CRITICAL_PARAMETRIZABILITY_TABLES.length} parametrizability signal tables are present.`
            : `${input.existingParametrizabilityTableCount}/${CRITICAL_PARAMETRIZABILITY_TABLES.length} parametrizability signal tables were found.`,
    },
    {
      name: 'workspace_limit_parametrizability',
      label: 'Workspace limit parametrizability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit parametrizability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit parametrizability signals.'
            : 'Production parametrizability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_parametrizability',
      label: 'Usage event parametrizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event parametrizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event parametrizability signals.'
            : 'Production parametrizability rollout requires a usage_events table.',
    },
    {
      name: 'parametrization_readiness_signal',
      label: 'Parametrization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          parametrizabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Parametrization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              parametrizabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support parametrization readiness.'
            : 'Production parametrizability rollout requires PostgreSQL connectivity, parametrizability tables, workspace limit parametrizability, usage event parametrizability, and full signal coverage.',
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
        ? 'Production parametrizability rollout checks passed. Parametrizability coverage and parametrization readiness signal signals are healthy.'
        : 'Production parametrizability rollout is not ready. Resolve failed checks before relying on production parametrizability tooling.',
  }
}

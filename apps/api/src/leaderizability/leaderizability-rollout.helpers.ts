import type { ApiEnv } from '../config/env.js'

export const CRITICAL_LEADERIZABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type LeaderizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type LeaderizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: LeaderizabilityRolloutCheck[]
  guidance: string
}

export type LeaderizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingLeaderizabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateLeaderizabilityRollout(
  input: LeaderizabilityRolloutInput,
): LeaderizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const leaderizabilityTableCoverageComplete =
    input.existingLeaderizabilityTableCount === CRITICAL_LEADERIZABILITY_TABLES.length

  const checks: LeaderizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL leaderizability checks can reach the database.'
            : 'Production leaderizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'leaderizability_signal_table_coverage',
      label: 'Leaderizability signal table coverage',
      status: leaderizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Leaderizability signal table coverage is only enforced in production.'
          : leaderizabilityTableCoverageComplete
            ? `${input.existingLeaderizabilityTableCount}/${CRITICAL_LEADERIZABILITY_TABLES.length} leaderizability signal tables are present.`
            : `${input.existingLeaderizabilityTableCount}/${CRITICAL_LEADERIZABILITY_TABLES.length} leaderizability signal tables were found.`,
    },
    {
      name: 'workspace_limit_leaderizability',
      label: 'Workspace limit leaderizability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit leaderizability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit leaderizability signals.'
            : 'Production leaderizability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_leaderizability',
      label: 'Usage event leaderizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event leaderizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event leaderizability signals.'
            : 'Production leaderizability rollout requires a usage_events table.',
    },
    {
      name: 'leaderization_readiness_signal',
      label: 'Federatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          leaderizabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Federatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              leaderizabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support leaderization readiness.'
            : 'Production leaderizability rollout requires PostgreSQL connectivity, leaderizability tables, workspace limit leaderizability, usage event leaderizability, and full signal coverage.',
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
        ? 'Production leaderizability rollout checks passed. Leaderizability coverage and federatization readiness signal signals are healthy.'
        : 'Production leaderizability rollout is not ready. Resolve failed checks before relying on production leaderizability tooling.',
  }
}

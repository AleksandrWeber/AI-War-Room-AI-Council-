import type { ApiEnv } from '../config/env.js'

export const CRITICAL_FAILOVERIZABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type FailoverizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type FailoverizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: FailoverizabilityRolloutCheck[]
  guidance: string
}

export type FailoverizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingFailoverizabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateFailoverizabilityRollout(
  input: FailoverizabilityRolloutInput,
): FailoverizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const failoverizabilityTableCoverageComplete =
    input.existingFailoverizabilityTableCount === CRITICAL_FAILOVERIZABILITY_TABLES.length

  const checks: FailoverizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL failoverizability checks can reach the database.'
            : 'Production failoverizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'failoverizability_signal_table_coverage',
      label: 'Failoverizability signal table coverage',
      status: failoverizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Failoverizability signal table coverage is only enforced in production.'
          : failoverizabilityTableCoverageComplete
            ? `${input.existingFailoverizabilityTableCount}/${CRITICAL_FAILOVERIZABILITY_TABLES.length} failoverizability signal tables are present.`
            : `${input.existingFailoverizabilityTableCount}/${CRITICAL_FAILOVERIZABILITY_TABLES.length} failoverizability signal tables were found.`,
    },
    {
      name: 'workspace_limit_failoverizability',
      label: 'Workspace limit failoverizability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit failoverizability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit failoverizability signals.'
            : 'Production failoverizability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_failoverizability',
      label: 'Usage event failoverizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event failoverizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event failoverizability signals.'
            : 'Production failoverizability rollout requires a usage_events table.',
    },
    {
      name: 'failoverization_readiness_signal',
      label: 'Failoverization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          failoverizabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Failoverization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              failoverizabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support failoverization readiness.'
            : 'Production failoverizability rollout requires PostgreSQL connectivity, failoverizability tables, workspace limit failoverizability, usage event failoverizability, and full signal coverage.',
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
        ? 'Production failoverizability rollout checks passed. Failoverizability coverage and failoverization readiness signal signals are healthy.'
        : 'Production failoverizability rollout is not ready. Resolve failed checks before relying on production failoverizability tooling.',
  }
}

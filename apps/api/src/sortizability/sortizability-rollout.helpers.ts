import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SORTIZABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type SortizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SortizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SortizabilityRolloutCheck[]
  guidance: string
}

export type SortizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSortizabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateSortizabilityRollout(
  input: SortizabilityRolloutInput,
): SortizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const sortizabilityTableCoverageComplete =
    input.existingSortizabilityTableCount === CRITICAL_SORTIZABILITY_TABLES.length

  const checks: SortizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL sortizability checks can reach the database.'
            : 'Production sortizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'sortizability_signal_table_coverage',
      label: 'Sortizability signal table coverage',
      status: sortizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Sortizability signal table coverage is only enforced in production.'
          : sortizabilityTableCoverageComplete
            ? `${input.existingSortizabilityTableCount}/${CRITICAL_SORTIZABILITY_TABLES.length} sortizability signal tables are present.`
            : `${input.existingSortizabilityTableCount}/${CRITICAL_SORTIZABILITY_TABLES.length} sortizability signal tables were found.`,
    },
    {
      name: 'workspace_limit_sortizability',
      label: 'Workspace limit sortizability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit sortizability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit sortizability signals.'
            : 'Production sortizability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_sortizability',
      label: 'Usage event sortizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event sortizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event sortizability signals.'
            : 'Production sortizability rollout requires a usage_events table.',
    },
    {
      name: 'sortization_readiness_signal',
      label: 'Federatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          sortizabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Federatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              sortizabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support sortization readiness.'
            : 'Production sortizability rollout requires PostgreSQL connectivity, sortizability tables, workspace limit sortizability, usage event sortizability, and full signal coverage.',
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
        ? 'Production sortizability rollout checks passed. Sortizability coverage and federatization readiness signal signals are healthy.'
        : 'Production sortizability rollout is not ready. Resolve failed checks before relying on production sortizability tooling.',
  }
}

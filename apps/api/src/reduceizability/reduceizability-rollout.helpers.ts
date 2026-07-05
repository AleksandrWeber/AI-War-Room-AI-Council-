import type { ApiEnv } from '../config/env.js'

export const CRITICAL_REDUCEIZABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type ReduceizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ReduceizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ReduceizabilityRolloutCheck[]
  guidance: string
}

export type ReduceizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingReduceizabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateReduceizabilityRollout(
  input: ReduceizabilityRolloutInput,
): ReduceizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const reduceizabilityTableCoverageComplete =
    input.existingReduceizabilityTableCount === CRITICAL_REDUCEIZABILITY_TABLES.length

  const checks: ReduceizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL reduceizability checks can reach the database.'
            : 'Production reduceizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'reduceizability_signal_table_coverage',
      label: 'Reduceizability signal table coverage',
      status: reduceizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Reduceizability signal table coverage is only enforced in production.'
          : reduceizabilityTableCoverageComplete
            ? `${input.existingReduceizabilityTableCount}/${CRITICAL_REDUCEIZABILITY_TABLES.length} reduceizability signal tables are present.`
            : `${input.existingReduceizabilityTableCount}/${CRITICAL_REDUCEIZABILITY_TABLES.length} reduceizability signal tables were found.`,
    },
    {
      name: 'workspace_limit_reduceizability',
      label: 'Workspace limit reduceizability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit reduceizability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit reduceizability signals.'
            : 'Production reduceizability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_reduceizability',
      label: 'Usage event reduceizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event reduceizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event reduceizability signals.'
            : 'Production reduceizability rollout requires a usage_events table.',
    },
    {
      name: 'reduceization_readiness_signal',
      label: 'Federatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          reduceizabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Federatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              reduceizabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support reduceization readiness.'
            : 'Production reduceizability rollout requires PostgreSQL connectivity, reduceizability tables, workspace limit reduceizability, usage event reduceizability, and full signal coverage.',
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
        ? 'Production reduceizability rollout checks passed. Reduceizability coverage and federatization readiness signal signals are healthy.'
        : 'Production reduceizability rollout is not ready. Resolve failed checks before relying on production reduceizability tooling.',
  }
}

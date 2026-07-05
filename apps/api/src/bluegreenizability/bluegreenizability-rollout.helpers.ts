import type { ApiEnv } from '../config/env.js'

export const CRITICAL_BLUEGREENIZABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type BluegreenizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type BluegreenizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: BluegreenizabilityRolloutCheck[]
  guidance: string
}

export type BluegreenizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingBluegreenizabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateBluegreenizabilityRollout(
  input: BluegreenizabilityRolloutInput,
): BluegreenizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const bluegreenizabilityTableCoverageComplete =
    input.existingBluegreenizabilityTableCount === CRITICAL_BLUEGREENIZABILITY_TABLES.length

  const checks: BluegreenizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL bluegreenizability checks can reach the database.'
            : 'Production bluegreenizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'bluegreenizability_signal_table_coverage',
      label: 'Bluegreenizability signal table coverage',
      status: bluegreenizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Bluegreenizability signal table coverage is only enforced in production.'
          : bluegreenizabilityTableCoverageComplete
            ? `${input.existingBluegreenizabilityTableCount}/${CRITICAL_BLUEGREENIZABILITY_TABLES.length} bluegreenizability signal tables are present.`
            : `${input.existingBluegreenizabilityTableCount}/${CRITICAL_BLUEGREENIZABILITY_TABLES.length} bluegreenizability signal tables were found.`,
    },
    {
      name: 'workspace_limit_bluegreenizability',
      label: 'Workspace limit bluegreenizability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit bluegreenizability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit bluegreenizability signals.'
            : 'Production bluegreenizability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_bluegreenizability',
      label: 'Usage event bluegreenizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event bluegreenizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event bluegreenizability signals.'
            : 'Production bluegreenizability rollout requires a usage_events table.',
    },
    {
      name: 'bluegreenization_readiness_signal',
      label: 'Bluegreenization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          bluegreenizabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Bluegreenization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              bluegreenizabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support bluegreenization readiness.'
            : 'Production bluegreenizability rollout requires PostgreSQL connectivity, bluegreenizability tables, workspace limit bluegreenizability, usage event bluegreenizability, and full signal coverage.',
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
        ? 'Production bluegreenizability rollout checks passed. Bluegreenizability coverage and bluegreenization readiness signal signals are healthy.'
        : 'Production bluegreenizability rollout is not ready. Resolve failed checks before relying on production bluegreenizability tooling.',
  }
}

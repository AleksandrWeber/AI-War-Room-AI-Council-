import type { ApiEnv } from '../config/env.js'

export const CRITICAL_HEURISTIZABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type HeuristizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type HeuristizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: HeuristizabilityRolloutCheck[]
  guidance: string
}

export type HeuristizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingHeuristizabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateHeuristizabilityRollout(
  input: HeuristizabilityRolloutInput,
): HeuristizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const heuristizabilityTableCoverageComplete =
    input.existingHeuristizabilityTableCount === CRITICAL_HEURISTIZABILITY_TABLES.length

  const checks: HeuristizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL heuristizability checks can reach the database.'
            : 'Production heuristizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'heuristizability_signal_table_coverage',
      label: 'Heuristizability signal table coverage',
      status: heuristizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Heuristizability signal table coverage is only enforced in production.'
          : heuristizabilityTableCoverageComplete
            ? `${input.existingHeuristizabilityTableCount}/${CRITICAL_HEURISTIZABILITY_TABLES.length} heuristizability signal tables are present.`
            : `${input.existingHeuristizabilityTableCount}/${CRITICAL_HEURISTIZABILITY_TABLES.length} heuristizability signal tables were found.`,
    },
    {
      name: 'workspace_limit_heuristizability',
      label: 'Workspace limit heuristizability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit heuristizability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit heuristizability signals.'
            : 'Production heuristizability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_heuristizability',
      label: 'Usage event heuristizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event heuristizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event heuristizability signals.'
            : 'Production heuristizability rollout requires a usage_events table.',
    },
    {
      name: 'heuristization_readiness_signal',
      label: 'Heuristization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          heuristizabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Heuristization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              heuristizabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support heuristization readiness.'
            : 'Production heuristizability rollout requires PostgreSQL connectivity, heuristizability tables, workspace limit heuristizability, usage event heuristizability, and full signal coverage.',
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
        ? 'Production heuristizability rollout checks passed. Heuristizability coverage and heuristization readiness signal signals are healthy.'
        : 'Production heuristizability rollout is not ready. Resolve failed checks before relying on production heuristizability tooling.',
  }
}

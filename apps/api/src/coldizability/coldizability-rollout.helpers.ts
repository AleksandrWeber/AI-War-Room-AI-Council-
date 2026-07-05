import type { ApiEnv } from '../config/env.js'

export const CRITICAL_COLDIZABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type ColdizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ColdizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ColdizabilityRolloutCheck[]
  guidance: string
}

export type ColdizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingColdizabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateColdizabilityRollout(
  input: ColdizabilityRolloutInput,
): ColdizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const coldizabilityTableCoverageComplete =
    input.existingColdizabilityTableCount === CRITICAL_COLDIZABILITY_TABLES.length

  const checks: ColdizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL coldizability checks can reach the database.'
            : 'Production coldizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'coldizability_signal_table_coverage',
      label: 'Coldizability signal table coverage',
      status: coldizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Coldizability signal table coverage is only enforced in production.'
          : coldizabilityTableCoverageComplete
            ? `${input.existingColdizabilityTableCount}/${CRITICAL_COLDIZABILITY_TABLES.length} coldizability signal tables are present.`
            : `${input.existingColdizabilityTableCount}/${CRITICAL_COLDIZABILITY_TABLES.length} coldizability signal tables were found.`,
    },
    {
      name: 'workspace_limit_coldizability',
      label: 'Workspace limit coldizability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit coldizability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit coldizability signals.'
            : 'Production coldizability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_coldizability',
      label: 'Usage event coldizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event coldizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event coldizability signals.'
            : 'Production coldizability rollout requires a usage_events table.',
    },
    {
      name: 'coldization_readiness_signal',
      label: 'Federatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          coldizabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Federatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              coldizabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support coldization readiness.'
            : 'Production coldizability rollout requires PostgreSQL connectivity, coldizability tables, workspace limit coldizability, usage event coldizability, and full signal coverage.',
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
        ? 'Production coldizability rollout checks passed. Coldizability coverage and federatization readiness signal signals are healthy.'
        : 'Production coldizability rollout is not ready. Resolve failed checks before relying on production coldizability tooling.',
  }
}

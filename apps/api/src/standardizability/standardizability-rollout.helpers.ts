import type { ApiEnv } from '../config/env.js'

export const CRITICAL_STANDARDIZABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type StandardizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type StandardizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: StandardizabilityRolloutCheck[]
  guidance: string
}

export type StandardizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingStandardizabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateStandardizabilityRollout(
  input: StandardizabilityRolloutInput,
): StandardizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const standardizabilityTableCoverageComplete =
    input.existingStandardizabilityTableCount === CRITICAL_STANDARDIZABILITY_TABLES.length

  const checks: StandardizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL standardizability checks can reach the database.'
            : 'Production standardizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'standardizability_signal_table_coverage',
      label: 'Standardizability signal table coverage',
      status: standardizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Standardizability signal table coverage is only enforced in production.'
          : standardizabilityTableCoverageComplete
            ? `${input.existingStandardizabilityTableCount}/${CRITICAL_STANDARDIZABILITY_TABLES.length} standardizability signal tables are present.`
            : `${input.existingStandardizabilityTableCount}/${CRITICAL_STANDARDIZABILITY_TABLES.length} standardizability signal tables were found.`,
    },
    {
      name: 'workspace_limit_standardizability',
      label: 'Workspace limit standardizability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit standardizability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit standardizability signals.'
            : 'Production standardizability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_standardizability',
      label: 'Usage event standardizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event standardizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event standardizability signals.'
            : 'Production standardizability rollout requires a usage_events table.',
    },
    {
      name: 'standardization_readiness_signal',
      label: 'Standardization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          standardizabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Standardization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              standardizabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support standardization readiness.'
            : 'Production standardizability rollout requires PostgreSQL connectivity, standardizability tables, workspace limit standardizability, usage event standardizability, and full signal coverage.',
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
        ? 'Production standardizability rollout checks passed. Standardizability coverage and standardization readiness signal signals are healthy.'
        : 'Production standardizability rollout is not ready. Resolve failed checks before relying on production standardizability tooling.',
  }
}

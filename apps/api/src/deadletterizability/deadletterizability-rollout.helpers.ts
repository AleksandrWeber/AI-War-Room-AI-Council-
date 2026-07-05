import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DEADLETTERIZABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type DeadletterizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DeadletterizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DeadletterizabilityRolloutCheck[]
  guidance: string
}

export type DeadletterizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDeadletterizabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateDeadletterizabilityRollout(
  input: DeadletterizabilityRolloutInput,
): DeadletterizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const deadletterizabilityTableCoverageComplete =
    input.existingDeadletterizabilityTableCount === CRITICAL_DEADLETTERIZABILITY_TABLES.length

  const checks: DeadletterizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL deadletterizability checks can reach the database.'
            : 'Production deadletterizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'deadletterizability_signal_table_coverage',
      label: 'Deadletterizability signal table coverage',
      status: deadletterizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Deadletterizability signal table coverage is only enforced in production.'
          : deadletterizabilityTableCoverageComplete
            ? `${input.existingDeadletterizabilityTableCount}/${CRITICAL_DEADLETTERIZABILITY_TABLES.length} deadletterizability signal tables are present.`
            : `${input.existingDeadletterizabilityTableCount}/${CRITICAL_DEADLETTERIZABILITY_TABLES.length} deadletterizability signal tables were found.`,
    },
    {
      name: 'workspace_limit_deadletterizability',
      label: 'Workspace limit deadletterizability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit deadletterizability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit deadletterizability signals.'
            : 'Production deadletterizability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_deadletterizability',
      label: 'Usage event deadletterizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event deadletterizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event deadletterizability signals.'
            : 'Production deadletterizability rollout requires a usage_events table.',
    },
    {
      name: 'deadletterization_readiness_signal',
      label: 'Federatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          deadletterizabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Federatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              deadletterizabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support deadletterization readiness.'
            : 'Production deadletterizability rollout requires PostgreSQL connectivity, deadletterizability tables, workspace limit deadletterizability, usage event deadletterizability, and full signal coverage.',
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
        ? 'Production deadletterizability rollout checks passed. Deadletterizability coverage and federatization readiness signal signals are healthy.'
        : 'Production deadletterizability rollout is not ready. Resolve failed checks before relying on production deadletterizability tooling.',
  }
}

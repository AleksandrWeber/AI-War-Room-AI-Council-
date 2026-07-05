import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CONVERGIZABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type ConvergizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ConvergizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ConvergizabilityRolloutCheck[]
  guidance: string
}

export type ConvergizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingConvergizabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateConvergizabilityRollout(
  input: ConvergizabilityRolloutInput,
): ConvergizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const convergizabilityTableCoverageComplete =
    input.existingConvergizabilityTableCount === CRITICAL_CONVERGIZABILITY_TABLES.length

  const checks: ConvergizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL convergizability checks can reach the database.'
            : 'Production convergizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'convergizability_signal_table_coverage',
      label: 'Convergizability signal table coverage',
      status: convergizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Convergizability signal table coverage is only enforced in production.'
          : convergizabilityTableCoverageComplete
            ? `${input.existingConvergizabilityTableCount}/${CRITICAL_CONVERGIZABILITY_TABLES.length} convergizability signal tables are present.`
            : `${input.existingConvergizabilityTableCount}/${CRITICAL_CONVERGIZABILITY_TABLES.length} convergizability signal tables were found.`,
    },
    {
      name: 'workspace_limit_convergizability',
      label: 'Workspace limit convergizability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit convergizability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit convergizability signals.'
            : 'Production convergizability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_convergizability',
      label: 'Usage event convergizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event convergizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event convergizability signals.'
            : 'Production convergizability rollout requires a usage_events table.',
    },
    {
      name: 'convergization_readiness_signal',
      label: 'Convergization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          convergizabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Convergization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              convergizabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support convergization readiness.'
            : 'Production convergizability rollout requires PostgreSQL connectivity, convergizability tables, workspace limit convergizability, usage event convergizability, and full signal coverage.',
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
        ? 'Production convergizability rollout checks passed. Convergizability coverage and convergization readiness signal signals are healthy.'
        : 'Production convergizability rollout is not ready. Resolve failed checks before relying on production convergizability tooling.',
  }
}

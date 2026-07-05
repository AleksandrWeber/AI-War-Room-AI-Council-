import type { ApiEnv } from '../config/env.js'

export const CRITICAL_METHODIZABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type MethodizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type MethodizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: MethodizabilityRolloutCheck[]
  guidance: string
}

export type MethodizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingMethodizabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateMethodizabilityRollout(
  input: MethodizabilityRolloutInput,
): MethodizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const methodizabilityTableCoverageComplete =
    input.existingMethodizabilityTableCount === CRITICAL_METHODIZABILITY_TABLES.length

  const checks: MethodizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL methodizability checks can reach the database.'
            : 'Production methodizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'methodizability_signal_table_coverage',
      label: 'Methodizability signal table coverage',
      status: methodizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Methodizability signal table coverage is only enforced in production.'
          : methodizabilityTableCoverageComplete
            ? `${input.existingMethodizabilityTableCount}/${CRITICAL_METHODIZABILITY_TABLES.length} methodizability signal tables are present.`
            : `${input.existingMethodizabilityTableCount}/${CRITICAL_METHODIZABILITY_TABLES.length} methodizability signal tables were found.`,
    },
    {
      name: 'workspace_limit_methodizability',
      label: 'Workspace limit methodizability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit methodizability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit methodizability signals.'
            : 'Production methodizability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_methodizability',
      label: 'Usage event methodizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event methodizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event methodizability signals.'
            : 'Production methodizability rollout requires a usage_events table.',
    },
    {
      name: 'methodization_readiness_signal',
      label: 'Methodization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          methodizabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Methodization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              methodizabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support methodization readiness.'
            : 'Production methodizability rollout requires PostgreSQL connectivity, methodizability tables, workspace limit methodizability, usage event methodizability, and full signal coverage.',
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
        ? 'Production methodizability rollout checks passed. Methodizability coverage and methodization readiness signal signals are healthy.'
        : 'Production methodizability rollout is not ready. Resolve failed checks before relying on production methodizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_UTILIZATION_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'workspace_memberships',
] as const

export type UtilizationRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type UtilizationRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: UtilizationRolloutCheck[]
  guidance: string
}

export type UtilizationRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingUtilizationTableCount: number
  usageEventsTableExists: boolean
  workspaceMembershipsTableExists: boolean
  usageLimitsTableExists: boolean
}

export function evaluateUtilizationRollout(
  input: UtilizationRolloutInput,
): UtilizationRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const utilizationTableCoverageComplete =
    input.existingUtilizationTableCount === CRITICAL_UTILIZATION_TABLES.length

  const checks: UtilizationRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL utilization checks can reach the database.'
            : 'Production utilization rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'utilization_signal_table_coverage',
      label: 'Utilization signal table coverage',
      status:
        utilizationTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Utilization signal table coverage is only enforced in production.'
          : utilizationTableCoverageComplete
            ? `${input.existingUtilizationTableCount}/${CRITICAL_UTILIZATION_TABLES.length} utilization signal tables are present.`
            : `${input.existingUtilizationTableCount}/${CRITICAL_UTILIZATION_TABLES.length} utilization signal tables were found.`,
    },
    {
      name: 'usage_consumption_utilization',
      label: 'Usage consumption utilization',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage consumption utilization is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage consumption utilization signals.'
            : 'Production utilization rollout requires a usage_events table.',
    },
    {
      name: 'membership_utilization',
      label: 'Membership utilization',
      status:
        input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership utilization is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership utilization signals.'
            : 'Production utilization rollout requires a workspace_memberships table.',
    },
    {
      name: 'capacity_readiness_signal',
      label: 'Capacity readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          utilizationTableCoverageComplete &&
          input.usageEventsTableExists &&
          input.workspaceMembershipsTableExists &&
          input.usageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Capacity readiness is only enforced in production.'
          : input.postgresConnectivity &&
              utilizationTableCoverageComplete &&
              input.usageEventsTableExists &&
              input.workspaceMembershipsTableExists &&
              input.usageLimitsTableExists
            ? 'Usage limits, usage telemetry, and membership growth support capacity readiness.'
            : 'Production utilization rollout requires PostgreSQL connectivity, utilization tables, usage consumption, membership utilization, and usage limit coverage.',
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
        ? 'Production utilization rollout checks passed. Utilization coverage and capacity readiness signals are healthy.'
        : 'Production utilization rollout is not ready. Resolve failed checks before relying on production utilization tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CONSUMIZABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type ConsumizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ConsumizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ConsumizabilityRolloutCheck[]
  guidance: string
}

export type ConsumizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingConsumizabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateConsumizabilityRollout(
  input: ConsumizabilityRolloutInput,
): ConsumizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const consumizabilityTableCoverageComplete =
    input.existingConsumizabilityTableCount === CRITICAL_CONSUMIZABILITY_TABLES.length

  const checks: ConsumizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL consumizability checks can reach the database.'
            : 'Production consumizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'consumizability_signal_table_coverage',
      label: 'Consumizability signal table coverage',
      status: consumizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Consumizability signal table coverage is only enforced in production.'
          : consumizabilityTableCoverageComplete
            ? `${input.existingConsumizabilityTableCount}/${CRITICAL_CONSUMIZABILITY_TABLES.length} consumizability signal tables are present.`
            : `${input.existingConsumizabilityTableCount}/${CRITICAL_CONSUMIZABILITY_TABLES.length} consumizability signal tables were found.`,
    },
    {
      name: 'workspace_limit_consumizability',
      label: 'Workspace limit consumizability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit consumizability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit consumizability signals.'
            : 'Production consumizability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_consumizability',
      label: 'Usage event consumizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event consumizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event consumizability signals.'
            : 'Production consumizability rollout requires a usage_events table.',
    },
    {
      name: 'consumization_readiness_signal',
      label: 'Federatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          consumizabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Federatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              consumizabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support consumization readiness.'
            : 'Production consumizability rollout requires PostgreSQL connectivity, consumizability tables, workspace limit consumizability, usage event consumizability, and full signal coverage.',
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
        ? 'Production consumizability rollout checks passed. Consumizability coverage and federatization readiness signal signals are healthy.'
        : 'Production consumizability rollout is not ready. Resolve failed checks before relying on production consumizability tooling.',
  }
}

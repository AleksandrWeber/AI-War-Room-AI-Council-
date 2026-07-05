import type { ApiEnv } from '../config/env.js'

export const CRITICAL_LOADBALANCIZABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type LoadbalancizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type LoadbalancizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: LoadbalancizabilityRolloutCheck[]
  guidance: string
}

export type LoadbalancizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingLoadbalancizabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateLoadbalancizabilityRollout(
  input: LoadbalancizabilityRolloutInput,
): LoadbalancizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const loadbalancizabilityTableCoverageComplete =
    input.existingLoadbalancizabilityTableCount === CRITICAL_LOADBALANCIZABILITY_TABLES.length

  const checks: LoadbalancizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL loadbalancizability checks can reach the database.'
            : 'Production loadbalancizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'loadbalancizability_signal_table_coverage',
      label: 'Loadbalancizability signal table coverage',
      status: loadbalancizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Loadbalancizability signal table coverage is only enforced in production.'
          : loadbalancizabilityTableCoverageComplete
            ? `${input.existingLoadbalancizabilityTableCount}/${CRITICAL_LOADBALANCIZABILITY_TABLES.length} loadbalancizability signal tables are present.`
            : `${input.existingLoadbalancizabilityTableCount}/${CRITICAL_LOADBALANCIZABILITY_TABLES.length} loadbalancizability signal tables were found.`,
    },
    {
      name: 'workspace_limit_loadbalancizability',
      label: 'Workspace limit loadbalancizability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit loadbalancizability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit loadbalancizability signals.'
            : 'Production loadbalancizability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_loadbalancizability',
      label: 'Usage event loadbalancizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event loadbalancizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event loadbalancizability signals.'
            : 'Production loadbalancizability rollout requires a usage_events table.',
    },
    {
      name: 'loadbalancization_readiness_signal',
      label: 'Loadbalancization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          loadbalancizabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Loadbalancization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              loadbalancizabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support loadbalancization readiness.'
            : 'Production loadbalancizability rollout requires PostgreSQL connectivity, loadbalancizability tables, workspace limit loadbalancizability, usage event loadbalancizability, and full signal coverage.',
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
        ? 'Production loadbalancizability rollout checks passed. Loadbalancizability coverage and loadbalancization readiness signal signals are healthy.'
        : 'Production loadbalancizability rollout is not ready. Resolve failed checks before relying on production loadbalancizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_COLLECTIZABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type CollectizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CollectizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CollectizabilityRolloutCheck[]
  guidance: string
}

export type CollectizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCollectizabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateCollectizabilityRollout(
  input: CollectizabilityRolloutInput,
): CollectizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const collectizabilityTableCoverageComplete =
    input.existingCollectizabilityTableCount === CRITICAL_COLLECTIZABILITY_TABLES.length

  const checks: CollectizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL collectizability checks can reach the database.'
            : 'Production collectizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'collectizability_signal_table_coverage',
      label: 'Collectizability signal table coverage',
      status: collectizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Collectizability signal table coverage is only enforced in production.'
          : collectizabilityTableCoverageComplete
            ? `${input.existingCollectizabilityTableCount}/${CRITICAL_COLLECTIZABILITY_TABLES.length} collectizability signal tables are present.`
            : `${input.existingCollectizabilityTableCount}/${CRITICAL_COLLECTIZABILITY_TABLES.length} collectizability signal tables were found.`,
    },
    {
      name: 'workspace_limit_collectizability',
      label: 'Workspace limit collectizability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit collectizability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit collectizability signals.'
            : 'Production collectizability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_collectizability',
      label: 'Usage event collectizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event collectizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event collectizability signals.'
            : 'Production collectizability rollout requires a usage_events table.',
    },
    {
      name: 'collectization_readiness_signal',
      label: 'Collectization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          collectizabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Collectization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              collectizabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support collectization readiness.'
            : 'Production collectizability rollout requires PostgreSQL connectivity, collectizability tables, workspace limit collectizability, usage event collectizability, and full signal coverage.',
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
        ? 'Production collectizability rollout checks passed. Collectizability coverage and collectization readiness signal signals are healthy.'
        : 'Production collectizability rollout is not ready. Resolve failed checks before relying on production collectizability tooling.',
  }
}

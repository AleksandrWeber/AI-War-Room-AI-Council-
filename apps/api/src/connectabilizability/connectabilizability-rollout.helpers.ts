import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CONNECTABILIZABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type ConnectabilizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ConnectabilizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ConnectabilizabilityRolloutCheck[]
  guidance: string
}

export type ConnectabilizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingConnectabilizabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateConnectabilizabilityRollout(
  input: ConnectabilizabilityRolloutInput,
): ConnectabilizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const connectabilizabilityTableCoverageComplete =
    input.existingConnectabilizabilityTableCount === CRITICAL_CONNECTABILIZABILITY_TABLES.length

  const checks: ConnectabilizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL connectabilizability checks can reach the database.'
            : 'Production connectabilizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'connectabilizability_signal_table_coverage',
      label: 'Connectabilizability signal table coverage',
      status: connectabilizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Connectabilizability signal table coverage is only enforced in production.'
          : connectabilizabilityTableCoverageComplete
            ? `${input.existingConnectabilizabilityTableCount}/${CRITICAL_CONNECTABILIZABILITY_TABLES.length} connectabilizability signal tables are present.`
            : `${input.existingConnectabilizabilityTableCount}/${CRITICAL_CONNECTABILIZABILITY_TABLES.length} connectabilizability signal tables were found.`,
    },
    {
      name: 'workspace_limit_connectabilizability',
      label: 'Workspace limit connectabilizability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit connectabilizability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit connectabilizability signals.'
            : 'Production connectabilizability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_connectabilizability',
      label: 'Usage event connectabilizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event connectabilizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event connectabilizability signals.'
            : 'Production connectabilizability rollout requires a usage_events table.',
    },
    {
      name: 'connectabilization_readiness_signal',
      label: 'Connectabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          connectabilizabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Connectabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              connectabilizabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support connectabilization readiness.'
            : 'Production connectabilizability rollout requires PostgreSQL connectivity, connectabilizability tables, workspace limit connectabilizability, usage event connectabilizability, and full signal coverage.',
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
        ? 'Production connectabilizability rollout checks passed. Connectabilizability coverage and connectabilization readiness signal signals are healthy.'
        : 'Production connectabilizability rollout is not ready. Resolve failed checks before relying on production connectabilizability tooling.',
  }
}

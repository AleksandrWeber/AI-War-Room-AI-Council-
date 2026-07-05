import type { ApiEnv } from '../config/env.js'

export const CRITICAL_BACKPRESSUREIZABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type BackpressureizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type BackpressureizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: BackpressureizabilityRolloutCheck[]
  guidance: string
}

export type BackpressureizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingBackpressureizabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateBackpressureizabilityRollout(
  input: BackpressureizabilityRolloutInput,
): BackpressureizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const backpressureizabilityTableCoverageComplete =
    input.existingBackpressureizabilityTableCount === CRITICAL_BACKPRESSUREIZABILITY_TABLES.length

  const checks: BackpressureizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL backpressureizability checks can reach the database.'
            : 'Production backpressureizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'backpressureizability_signal_table_coverage',
      label: 'Backpressureizability signal table coverage',
      status: backpressureizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Backpressureizability signal table coverage is only enforced in production.'
          : backpressureizabilityTableCoverageComplete
            ? `${input.existingBackpressureizabilityTableCount}/${CRITICAL_BACKPRESSUREIZABILITY_TABLES.length} backpressureizability signal tables are present.`
            : `${input.existingBackpressureizabilityTableCount}/${CRITICAL_BACKPRESSUREIZABILITY_TABLES.length} backpressureizability signal tables were found.`,
    },
    {
      name: 'workspace_limit_backpressureizability',
      label: 'Workspace limit backpressureizability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit backpressureizability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit backpressureizability signals.'
            : 'Production backpressureizability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_backpressureizability',
      label: 'Usage event backpressureizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event backpressureizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event backpressureizability signals.'
            : 'Production backpressureizability rollout requires a usage_events table.',
    },
    {
      name: 'backpressureization_readiness_signal',
      label: 'Federatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          backpressureizabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Federatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              backpressureizabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support backpressureization readiness.'
            : 'Production backpressureizability rollout requires PostgreSQL connectivity, backpressureizability tables, workspace limit backpressureizability, usage event backpressureizability, and full signal coverage.',
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
        ? 'Production backpressureizability rollout checks passed. Backpressureizability coverage and federatization readiness signal signals are healthy.'
        : 'Production backpressureizability rollout is not ready. Resolve failed checks before relying on production backpressureizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TRIGGERINGIZABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type TriggeringizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TriggeringizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TriggeringizabilityRolloutCheck[]
  guidance: string
}

export type TriggeringizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTriggeringizabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateTriggeringizabilityRollout(
  input: TriggeringizabilityRolloutInput,
): TriggeringizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const triggeringizabilityTableCoverageComplete =
    input.existingTriggeringizabilityTableCount === CRITICAL_TRIGGERINGIZABILITY_TABLES.length

  const checks: TriggeringizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL triggeringizability checks can reach the database.'
            : 'Production triggeringizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'triggeringizability_signal_table_coverage',
      label: 'Triggeringizability signal table coverage',
      status: triggeringizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Triggeringizability signal table coverage is only enforced in production.'
          : triggeringizabilityTableCoverageComplete
            ? `${input.existingTriggeringizabilityTableCount}/${CRITICAL_TRIGGERINGIZABILITY_TABLES.length} triggeringizability signal tables are present.`
            : `${input.existingTriggeringizabilityTableCount}/${CRITICAL_TRIGGERINGIZABILITY_TABLES.length} triggeringizability signal tables were found.`,
    },
    {
      name: 'workspace_limit_triggeringizability',
      label: 'Workspace limit triggeringizability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit triggeringizability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit triggeringizability signals.'
            : 'Production triggeringizability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_triggeringizability',
      label: 'Usage event triggeringizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event triggeringizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event triggeringizability signals.'
            : 'Production triggeringizability rollout requires a usage_events table.',
    },
    {
      name: 'triggeringization_readiness_signal',
      label: 'Federatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          triggeringizabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Federatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              triggeringizabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support triggeringization readiness.'
            : 'Production triggeringizability rollout requires PostgreSQL connectivity, triggeringizability tables, workspace limit triggeringizability, usage event triggeringizability, and full signal coverage.',
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
        ? 'Production triggeringizability rollout checks passed. Triggeringizability coverage and federatization readiness signal signals are healthy.'
        : 'Production triggeringizability rollout is not ready. Resolve failed checks before relying on production triggeringizability tooling.',
  }
}

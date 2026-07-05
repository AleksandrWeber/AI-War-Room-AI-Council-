import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TYPIFIABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type TypifiabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TypifiabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TypifiabilityRolloutCheck[]
  guidance: string
}

export type TypifiabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTypifiabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateTypifiabilityRollout(
  input: TypifiabilityRolloutInput,
): TypifiabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const typifiabilityTableCoverageComplete =
    input.existingTypifiabilityTableCount === CRITICAL_TYPIFIABILITY_TABLES.length

  const checks: TypifiabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL typifiability checks can reach the database.'
            : 'Production typifiability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'typifiability_signal_table_coverage',
      label: 'Typifiability signal table coverage',
      status: typifiabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Typifiability signal table coverage is only enforced in production.'
          : typifiabilityTableCoverageComplete
            ? `${input.existingTypifiabilityTableCount}/${CRITICAL_TYPIFIABILITY_TABLES.length} typifiability signal tables are present.`
            : `${input.existingTypifiabilityTableCount}/${CRITICAL_TYPIFIABILITY_TABLES.length} typifiability signal tables were found.`,
    },
    {
      name: 'workspace_limit_typifiability',
      label: 'Workspace limit typifiability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit typifiability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit typifiability signals.'
            : 'Production typifiability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_typifiability',
      label: 'Usage event typifiability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event typifiability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event typifiability signals.'
            : 'Production typifiability rollout requires a usage_events table.',
    },
    {
      name: 'typification_readiness_signal',
      label: 'Typification readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          typifiabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Typification readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              typifiabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support typification readiness.'
            : 'Production typifiability rollout requires PostgreSQL connectivity, typifiability tables, workspace limit typifiability, usage event typifiability, and full signal coverage.',
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
        ? 'Production typifiability rollout checks passed. Typifiability coverage and typification readiness signal signals are healthy.'
        : 'Production typifiability rollout is not ready. Resolve failed checks before relying on production typifiability tooling.',
  }
}

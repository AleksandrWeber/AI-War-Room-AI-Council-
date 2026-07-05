import type { ApiEnv } from '../config/env.js'

export const CRITICAL_MIGRATIZABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type MigratizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type MigratizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: MigratizabilityRolloutCheck[]
  guidance: string
}

export type MigratizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingMigratizabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateMigratizabilityRollout(
  input: MigratizabilityRolloutInput,
): MigratizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const migratizabilityTableCoverageComplete =
    input.existingMigratizabilityTableCount === CRITICAL_MIGRATIZABILITY_TABLES.length

  const checks: MigratizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL migratizability checks can reach the database.'
            : 'Production migratizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'migratizability_signal_table_coverage',
      label: 'Migratizability signal table coverage',
      status: migratizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Migratizability signal table coverage is only enforced in production.'
          : migratizabilityTableCoverageComplete
            ? `${input.existingMigratizabilityTableCount}/${CRITICAL_MIGRATIZABILITY_TABLES.length} migratizability signal tables are present.`
            : `${input.existingMigratizabilityTableCount}/${CRITICAL_MIGRATIZABILITY_TABLES.length} migratizability signal tables were found.`,
    },
    {
      name: 'workspace_limit_migratizability',
      label: 'Workspace limit migratizability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit migratizability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit migratizability signals.'
            : 'Production migratizability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_migratizability',
      label: 'Usage event migratizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event migratizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event migratizability signals.'
            : 'Production migratizability rollout requires a usage_events table.',
    },
    {
      name: 'migratization_readiness_signal',
      label: 'Migratization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          migratizabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Migratization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              migratizabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support migratization readiness.'
            : 'Production migratizability rollout requires PostgreSQL connectivity, migratizability tables, workspace limit migratizability, usage event migratizability, and full signal coverage.',
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
        ? 'Production migratizability rollout checks passed. Migratizability coverage and migratization readiness signal signals are healthy.'
        : 'Production migratizability rollout is not ready. Resolve failed checks before relying on production migratizability tooling.',
  }
}

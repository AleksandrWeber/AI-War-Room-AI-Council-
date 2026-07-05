import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ITERATIVIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type IterativizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type IterativizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: IterativizabilityRolloutCheck[]
  guidance: string
}

export type IterativizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingIterativizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateIterativizabilityRollout(
  input: IterativizabilityRolloutInput,
): IterativizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const iterativizabilityTableCoverageComplete =
    input.existingIterativizabilityTableCount === CRITICAL_ITERATIVIZABILITY_TABLES.length

  const checks: IterativizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL iterativizability checks can reach the database.'
            : 'Production iterativizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'iterativizability_signal_table_coverage',
      label: 'Iterativizability signal table coverage',
      status: iterativizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Iterativizability signal table coverage is only enforced in production.'
          : iterativizabilityTableCoverageComplete
            ? `${input.existingIterativizabilityTableCount}/${CRITICAL_ITERATIVIZABILITY_TABLES.length} iterativizability signal tables are present.`
            : `${input.existingIterativizabilityTableCount}/${CRITICAL_ITERATIVIZABILITY_TABLES.length} iterativizability signal tables were found.`,
    },
    {
      name: 'meter_usage_iterativizability',
      label: 'Meter usage iterativizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage iterativizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage iterativizability signals.'
            : 'Production iterativizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_iterativizability',
      label: 'Usage event iterativizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event iterativizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event iterativizability signals.'
            : 'Production iterativizability rollout requires a usage_events table.',
    },
    {
      name: 'iterativization_readiness_signal',
      label: 'Iterativization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          iterativizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Iterativization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              iterativizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support iterativization readiness.'
            : 'Production iterativizability rollout requires PostgreSQL connectivity, iterativizability tables, meter usage iterativizability, usage event iterativizability, and full signal coverage.',
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
        ? 'Production iterativizability rollout checks passed. Iterativizability coverage and iterativization readiness signal signals are healthy.'
        : 'Production iterativizability rollout is not ready. Resolve failed checks before relying on production iterativizability tooling.',
  }
}

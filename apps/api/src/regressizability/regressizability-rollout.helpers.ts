import type { ApiEnv } from '../config/env.js'

export const CRITICAL_REGRESSIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type RegressizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RegressizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RegressizabilityRolloutCheck[]
  guidance: string
}

export type RegressizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRegressizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateRegressizabilityRollout(
  input: RegressizabilityRolloutInput,
): RegressizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const regressizabilityTableCoverageComplete =
    input.existingRegressizabilityTableCount === CRITICAL_REGRESSIZABILITY_TABLES.length

  const checks: RegressizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL regressizability checks can reach the database.'
            : 'Production regressizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'regressizability_signal_table_coverage',
      label: 'Regressizability signal table coverage',
      status: regressizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Regressizability signal table coverage is only enforced in production.'
          : regressizabilityTableCoverageComplete
            ? `${input.existingRegressizabilityTableCount}/${CRITICAL_REGRESSIZABILITY_TABLES.length} regressizability signal tables are present.`
            : `${input.existingRegressizabilityTableCount}/${CRITICAL_REGRESSIZABILITY_TABLES.length} regressizability signal tables were found.`,
    },
    {
      name: 'meter_usage_regressizability',
      label: 'Meter usage regressizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage regressizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage regressizability signals.'
            : 'Production regressizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_regressizability',
      label: 'Usage event regressizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event regressizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event regressizability signals.'
            : 'Production regressizability rollout requires a usage_events table.',
    },
    {
      name: 'regressization_readiness_signal',
      label: 'Regressization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          regressizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Regressization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              regressizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support regressization readiness.'
            : 'Production regressizability rollout requires PostgreSQL connectivity, regressizability tables, meter usage regressizability, usage event regressizability, and full signal coverage.',
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
        ? 'Production regressizability rollout checks passed. Regressizability coverage and regressization readiness signal signals are healthy.'
        : 'Production regressizability rollout is not ready. Resolve failed checks before relying on production regressizability tooling.',
  }
}

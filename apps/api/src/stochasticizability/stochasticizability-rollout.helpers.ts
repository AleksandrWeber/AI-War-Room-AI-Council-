import type { ApiEnv } from '../config/env.js'

export const CRITICAL_STOCHASTICIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type StochasticizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type StochasticizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: StochasticizabilityRolloutCheck[]
  guidance: string
}

export type StochasticizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingStochasticizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateStochasticizabilityRollout(
  input: StochasticizabilityRolloutInput,
): StochasticizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const stochasticizabilityTableCoverageComplete =
    input.existingStochasticizabilityTableCount === CRITICAL_STOCHASTICIZABILITY_TABLES.length

  const checks: StochasticizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL stochasticizability checks can reach the database.'
            : 'Production stochasticizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'stochasticizability_signal_table_coverage',
      label: 'Stochasticizability signal table coverage',
      status: stochasticizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Stochasticizability signal table coverage is only enforced in production.'
          : stochasticizabilityTableCoverageComplete
            ? `${input.existingStochasticizabilityTableCount}/${CRITICAL_STOCHASTICIZABILITY_TABLES.length} stochasticizability signal tables are present.`
            : `${input.existingStochasticizabilityTableCount}/${CRITICAL_STOCHASTICIZABILITY_TABLES.length} stochasticizability signal tables were found.`,
    },
    {
      name: 'meter_usage_stochasticizability',
      label: 'Meter usage stochasticizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage stochasticizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage stochasticizability signals.'
            : 'Production stochasticizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_stochasticizability',
      label: 'Usage event stochasticizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event stochasticizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event stochasticizability signals.'
            : 'Production stochasticizability rollout requires a usage_events table.',
    },
    {
      name: 'stochasticization_readiness_signal',
      label: 'Stochasticization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          stochasticizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Stochasticization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              stochasticizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support stochasticization readiness.'
            : 'Production stochasticizability rollout requires PostgreSQL connectivity, stochasticizability tables, meter usage stochasticizability, usage event stochasticizability, and full signal coverage.',
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
        ? 'Production stochasticizability rollout checks passed. Stochasticizability coverage and stochasticization readiness signal signals are healthy.'
        : 'Production stochasticizability rollout is not ready. Resolve failed checks before relying on production stochasticizability tooling.',
  }
}

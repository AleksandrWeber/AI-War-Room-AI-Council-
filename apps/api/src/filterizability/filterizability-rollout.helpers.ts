import type { ApiEnv } from '../config/env.js'

export const CRITICAL_FILTERIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type FilterizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type FilterizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: FilterizabilityRolloutCheck[]
  guidance: string
}

export type FilterizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingFilterizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateFilterizabilityRollout(
  input: FilterizabilityRolloutInput,
): FilterizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const filterizabilityTableCoverageComplete =
    input.existingFilterizabilityTableCount === CRITICAL_FILTERIZABILITY_TABLES.length

  const checks: FilterizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL filterizability checks can reach the database.'
            : 'Production filterizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'filterizability_signal_table_coverage',
      label: 'Filterizability signal table coverage',
      status: filterizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Filterizability signal table coverage is only enforced in production.'
          : filterizabilityTableCoverageComplete
            ? `${input.existingFilterizabilityTableCount}/${CRITICAL_FILTERIZABILITY_TABLES.length} filterizability signal tables are present.`
            : `${input.existingFilterizabilityTableCount}/${CRITICAL_FILTERIZABILITY_TABLES.length} filterizability signal tables were found.`,
    },
    {
      name: 'meter_usage_filterizability',
      label: 'Meter usage filterizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage filterizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage filterizability signals.'
            : 'Production filterizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_filterizability',
      label: 'Usage event filterizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event filterizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event filterizability signals.'
            : 'Production filterizability rollout requires a usage_events table.',
    },
    {
      name: 'filterization_readiness_signal',
      label: 'Distributization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          filterizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Distributization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              filterizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support filterization readiness.'
            : 'Production filterizability rollout requires PostgreSQL connectivity, filterizability tables, meter usage filterizability, usage event filterizability, and full signal coverage.',
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
        ? 'Production filterizability rollout checks passed. Filterizability coverage and distributization readiness signal signals are healthy.'
        : 'Production filterizability rollout is not ready. Resolve failed checks before relying on production filterizability tooling.',
  }
}

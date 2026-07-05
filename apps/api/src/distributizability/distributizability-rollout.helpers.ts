import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DISTRIBUTIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type DistributizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DistributizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DistributizabilityRolloutCheck[]
  guidance: string
}

export type DistributizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDistributizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateDistributizabilityRollout(
  input: DistributizabilityRolloutInput,
): DistributizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const distributizabilityTableCoverageComplete =
    input.existingDistributizabilityTableCount === CRITICAL_DISTRIBUTIZABILITY_TABLES.length

  const checks: DistributizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL distributizability checks can reach the database.'
            : 'Production distributizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'distributizability_signal_table_coverage',
      label: 'Distributizability signal table coverage',
      status: distributizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Distributizability signal table coverage is only enforced in production.'
          : distributizabilityTableCoverageComplete
            ? `${input.existingDistributizabilityTableCount}/${CRITICAL_DISTRIBUTIZABILITY_TABLES.length} distributizability signal tables are present.`
            : `${input.existingDistributizabilityTableCount}/${CRITICAL_DISTRIBUTIZABILITY_TABLES.length} distributizability signal tables were found.`,
    },
    {
      name: 'meter_usage_distributizability',
      label: 'Meter usage distributizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage distributizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage distributizability signals.'
            : 'Production distributizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_distributizability',
      label: 'Usage event distributizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event distributizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event distributizability signals.'
            : 'Production distributizability rollout requires a usage_events table.',
    },
    {
      name: 'distributization_readiness_signal',
      label: 'Distributization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          distributizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Distributization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              distributizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support distributization readiness.'
            : 'Production distributizability rollout requires PostgreSQL connectivity, distributizability tables, meter usage distributizability, usage event distributizability, and full signal coverage.',
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
        ? 'Production distributizability rollout checks passed. Distributizability coverage and distributization readiness signal signals are healthy.'
        : 'Production distributizability rollout is not ready. Resolve failed checks before relying on production distributizability tooling.',
  }
}

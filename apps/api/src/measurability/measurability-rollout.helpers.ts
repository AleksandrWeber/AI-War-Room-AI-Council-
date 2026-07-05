import type { ApiEnv } from '../config/env.js'

export const CRITICAL_MEASURABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type MeasurabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type MeasurabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: MeasurabilityRolloutCheck[]
  guidance: string
}

export type MeasurabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingMeasurabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateMeasurabilityRollout(
  input: MeasurabilityRolloutInput,
): MeasurabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const measurabilityTableCoverageComplete =
    input.existingMeasurabilityTableCount === CRITICAL_MEASURABILITY_TABLES.length

  const checks: MeasurabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL measurability checks can reach the database.'
            : 'Production measurability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'measurability_signal_table_coverage',
      label: 'Measurability signal table coverage',
      status: measurabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Measurability signal table coverage is only enforced in production.'
          : measurabilityTableCoverageComplete
            ? `${input.existingMeasurabilityTableCount}/${CRITICAL_MEASURABILITY_TABLES.length} measurability signal tables are present.`
            : `${input.existingMeasurabilityTableCount}/${CRITICAL_MEASURABILITY_TABLES.length} measurability signal tables were found.`,
    },
    {
      name: 'meter_usage_measurability',
      label: 'Meter usage measurability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage measurability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage measurability signals.'
            : 'Production measurability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_measurability',
      label: 'Usage event measurability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event measurability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event measurability signals.'
            : 'Production measurability rollout requires a usage_events table.',
    },
    {
      name: 'measurement_readiness_signal',
      label: 'Measurement readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          measurabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Measurement readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              measurabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Meter usage reports, usage events, and workspace usage limits support measurement readiness.'
            : 'Production measurability rollout requires PostgreSQL connectivity, measurability tables, meter usage measurability, usage event measurability, and full signal coverage.',
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
        ? 'Production measurability rollout checks passed. Measurability coverage and measurement readiness signal signals are healthy.'
        : 'Production measurability rollout is not ready. Resolve failed checks before relying on production measurability tooling.',
  }
}

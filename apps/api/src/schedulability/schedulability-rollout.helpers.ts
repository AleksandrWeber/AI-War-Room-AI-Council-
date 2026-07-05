import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SCHEDULABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type SchedulabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SchedulabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SchedulabilityRolloutCheck[]
  guidance: string
}

export type SchedulabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSchedulabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateSchedulabilityRollout(
  input: SchedulabilityRolloutInput,
): SchedulabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const schedulabilityTableCoverageComplete =
    input.existingSchedulabilityTableCount === CRITICAL_SCHEDULABILITY_TABLES.length

  const checks: SchedulabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL schedulability checks can reach the database.'
            : 'Production schedulability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'schedulability_signal_table_coverage',
      label: 'Schedulability signal table coverage',
      status: schedulabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Schedulability signal table coverage is only enforced in production.'
          : schedulabilityTableCoverageComplete
            ? `${input.existingSchedulabilityTableCount}/${CRITICAL_SCHEDULABILITY_TABLES.length} schedulability signal tables are present.`
            : `${input.existingSchedulabilityTableCount}/${CRITICAL_SCHEDULABILITY_TABLES.length} schedulability signal tables were found.`,
    },
    {
      name: 'meter_usage_schedulability',
      label: 'Meter usage schedulability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage schedulability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage schedulability signals.'
            : 'Production schedulability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_schedulability',
      label: 'Usage event schedulability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event schedulability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event schedulability signals.'
            : 'Production schedulability rollout requires a usage_events table.',
    },
    {
      name: 'scheduling_readiness_signal',
      label: 'Scheduling readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          schedulabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Scheduling readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              schedulabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Meter usage reports, usage events, and workspace usage limits support scheduling readiness.'
            : 'Production schedulability rollout requires PostgreSQL connectivity, schedulability tables, meter usage schedulability, usage event schedulability, and full signal coverage.',
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
        ? 'Production schedulability rollout checks passed. Schedulability coverage and scheduling readiness signal signals are healthy.'
        : 'Production schedulability rollout is not ready. Resolve failed checks before relying on production schedulability tooling.',
  }
}

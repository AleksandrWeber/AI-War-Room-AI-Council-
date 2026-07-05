import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SCHEDULINGIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type SchedulingizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SchedulingizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SchedulingizabilityRolloutCheck[]
  guidance: string
}

export type SchedulingizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSchedulingizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateSchedulingizabilityRollout(
  input: SchedulingizabilityRolloutInput,
): SchedulingizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const schedulingizabilityTableCoverageComplete =
    input.existingSchedulingizabilityTableCount === CRITICAL_SCHEDULINGIZABILITY_TABLES.length

  const checks: SchedulingizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL schedulingizability checks can reach the database.'
            : 'Production schedulingizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'schedulingizability_signal_table_coverage',
      label: 'Schedulingizability signal table coverage',
      status: schedulingizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Schedulingizability signal table coverage is only enforced in production.'
          : schedulingizabilityTableCoverageComplete
            ? `${input.existingSchedulingizabilityTableCount}/${CRITICAL_SCHEDULINGIZABILITY_TABLES.length} schedulingizability signal tables are present.`
            : `${input.existingSchedulingizabilityTableCount}/${CRITICAL_SCHEDULINGIZABILITY_TABLES.length} schedulingizability signal tables were found.`,
    },
    {
      name: 'meter_usage_schedulingizability',
      label: 'Meter usage schedulingizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage schedulingizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage schedulingizability signals.'
            : 'Production schedulingizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_schedulingizability',
      label: 'Usage event schedulingizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event schedulingizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event schedulingizability signals.'
            : 'Production schedulingizability rollout requires a usage_events table.',
    },
    {
      name: 'schedulingization_readiness_signal',
      label: 'Distributization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          schedulingizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Distributization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              schedulingizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support schedulingization readiness.'
            : 'Production schedulingizability rollout requires PostgreSQL connectivity, schedulingizability tables, meter usage schedulingizability, usage event schedulingizability, and full signal coverage.',
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
        ? 'Production schedulingizability rollout checks passed. Schedulingizability coverage and distributization readiness signal signals are healthy.'
        : 'Production schedulingizability rollout is not ready. Resolve failed checks before relying on production schedulingizability tooling.',
  }
}

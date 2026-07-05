import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PRESENTABILITY_TABLES = [
  'usage_events',
  'billing_meter_usage_reports',
  'workspace_usage_limits',
] as const

export type PresentabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type PresentabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: PresentabilityRolloutCheck[]
  guidance: string
}

export type PresentabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingPresentabilityTableCount: number
  usageEventsTableExists: boolean
  billingMeterUsageReportsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluatePresentabilityRollout(
  input: PresentabilityRolloutInput,
): PresentabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const presentabilityTableCoverageComplete =
    input.existingPresentabilityTableCount === CRITICAL_PRESENTABILITY_TABLES.length

  const checks: PresentabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL presentability checks can reach the database.'
            : 'Production presentability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'presentability_signal_table_coverage',
      label: 'Presentability signal table coverage',
      status: presentabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Presentability signal table coverage is only enforced in production.'
          : presentabilityTableCoverageComplete
            ? `${input.existingPresentabilityTableCount}/${CRITICAL_PRESENTABILITY_TABLES.length} presentability signal tables are present.`
            : `${input.existingPresentabilityTableCount}/${CRITICAL_PRESENTABILITY_TABLES.length} presentability signal tables were found.`,
    },
    {
      name: 'usage_event_presentability',
      label: 'Usage event presentability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event presentability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event presentability signals.'
            : 'Production presentability rollout requires a usage_events table.',
    },
    {
      name: 'meter_usage_presentability',
      label: 'Meter usage presentability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage presentability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage presentability signals.'
            : 'Production presentability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'presentation_readiness_signal',
      label: 'Presentation readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          presentabilityTableCoverageComplete &&
          input.usageEventsTableExists &&
          input.billingMeterUsageReportsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Presentation readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              presentabilityTableCoverageComplete &&
              input.usageEventsTableExists &&
              input.billingMeterUsageReportsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Usage events, meter usage reports, and workspace usage limits support presentation readiness.'
            : 'Production presentability rollout requires PostgreSQL connectivity, presentability tables, usage event presentability, meter usage presentability, and full signal coverage.',
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
        ? 'Production presentability rollout checks passed. Presentability coverage and presentation readiness signal signals are healthy.'
        : 'Production presentability rollout is not ready. Resolve failed checks before relying on production presentability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_HARMONIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type HarmonizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type HarmonizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: HarmonizabilityRolloutCheck[]
  guidance: string
}

export type HarmonizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingHarmonizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateHarmonizabilityRollout(
  input: HarmonizabilityRolloutInput,
): HarmonizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const harmonizabilityTableCoverageComplete =
    input.existingHarmonizabilityTableCount === CRITICAL_HARMONIZABILITY_TABLES.length

  const checks: HarmonizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL harmonizability checks can reach the database.'
            : 'Production harmonizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'harmonizability_signal_table_coverage',
      label: 'Harmonizability signal table coverage',
      status: harmonizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Harmonizability signal table coverage is only enforced in production.'
          : harmonizabilityTableCoverageComplete
            ? `${input.existingHarmonizabilityTableCount}/${CRITICAL_HARMONIZABILITY_TABLES.length} harmonizability signal tables are present.`
            : `${input.existingHarmonizabilityTableCount}/${CRITICAL_HARMONIZABILITY_TABLES.length} harmonizability signal tables were found.`,
    },
    {
      name: 'meter_usage_harmonizability',
      label: 'Meter usage harmonizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage harmonizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage harmonizability signals.'
            : 'Production harmonizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_harmonizability',
      label: 'Usage event harmonizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event harmonizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event harmonizability signals.'
            : 'Production harmonizability rollout requires a usage_events table.',
    },
    {
      name: 'harmonization_readiness_signal',
      label: 'Harmonization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          harmonizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Harmonization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              harmonizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support harmonization readiness.'
            : 'Production harmonizability rollout requires PostgreSQL connectivity, harmonizability tables, meter usage harmonizability, usage event harmonizability, and full signal coverage.',
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
        ? 'Production harmonizability rollout checks passed. Harmonizability coverage and harmonization readiness signal signals are healthy.'
        : 'Production harmonizability rollout is not ready. Resolve failed checks before relying on production harmonizability tooling.',
  }
}

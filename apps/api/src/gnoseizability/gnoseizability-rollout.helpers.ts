import type { ApiEnv } from '../config/env.js'

export const CRITICAL_GNOSEIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type GnoseizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type GnoseizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: GnoseizabilityRolloutCheck[]
  guidance: string
}

export type GnoseizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingGnoseizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateGnoseizabilityRollout(
  input: GnoseizabilityRolloutInput,
): GnoseizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const gnoseizabilityTableCoverageComplete =
    input.existingGnoseizabilityTableCount === CRITICAL_GNOSEIZABILITY_TABLES.length

  const checks: GnoseizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL gnoseizability checks can reach the database.'
            : 'Production gnoseizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'gnoseizability_signal_table_coverage',
      label: 'Gnoseizability signal table coverage',
      status: gnoseizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Gnoseizability signal table coverage is only enforced in production.'
          : gnoseizabilityTableCoverageComplete
            ? `${input.existingGnoseizabilityTableCount}/${CRITICAL_GNOSEIZABILITY_TABLES.length} gnoseizability signal tables are present.`
            : `${input.existingGnoseizabilityTableCount}/${CRITICAL_GNOSEIZABILITY_TABLES.length} gnoseizability signal tables were found.`,
    },
    {
      name: 'meter_usage_gnoseizability',
      label: 'Meter usage gnoseizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage gnoseizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage gnoseizability signals.'
            : 'Production gnoseizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_gnoseizability',
      label: 'Usage event gnoseizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event gnoseizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event gnoseizability signals.'
            : 'Production gnoseizability rollout requires a usage_events table.',
    },
    {
      name: 'gnoseization_readiness_signal',
      label: 'Gnoseization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          gnoseizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Gnoseization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              gnoseizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support gnoseization readiness.'
            : 'Production gnoseizability rollout requires PostgreSQL connectivity, gnoseizability tables, meter usage gnoseizability, usage event gnoseizability, and full signal coverage.',
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
        ? 'Production gnoseizability rollout checks passed. Gnoseizability coverage and gnoseization readiness signal signals are healthy.'
        : 'Production gnoseizability rollout is not ready. Resolve failed checks before relying on production gnoseizability tooling.',
  }
}

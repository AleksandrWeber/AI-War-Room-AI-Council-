import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CURATIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type CuratizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CuratizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CuratizabilityRolloutCheck[]
  guidance: string
}

export type CuratizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCuratizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateCuratizabilityRollout(
  input: CuratizabilityRolloutInput,
): CuratizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const curatizabilityTableCoverageComplete =
    input.existingCuratizabilityTableCount === CRITICAL_CURATIZABILITY_TABLES.length

  const checks: CuratizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL curatizability checks can reach the database.'
            : 'Production curatizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'curatizability_signal_table_coverage',
      label: 'Curatizability signal table coverage',
      status: curatizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Curatizability signal table coverage is only enforced in production.'
          : curatizabilityTableCoverageComplete
            ? `${input.existingCuratizabilityTableCount}/${CRITICAL_CURATIZABILITY_TABLES.length} curatizability signal tables are present.`
            : `${input.existingCuratizabilityTableCount}/${CRITICAL_CURATIZABILITY_TABLES.length} curatizability signal tables were found.`,
    },
    {
      name: 'meter_usage_curatizability',
      label: 'Meter usage curatizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage curatizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage curatizability signals.'
            : 'Production curatizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_curatizability',
      label: 'Usage event curatizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event curatizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event curatizability signals.'
            : 'Production curatizability rollout requires a usage_events table.',
    },
    {
      name: 'curatization_readiness_signal',
      label: 'Curatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          curatizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Curatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              curatizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support curatization readiness.'
            : 'Production curatizability rollout requires PostgreSQL connectivity, curatizability tables, meter usage curatizability, usage event curatizability, and full signal coverage.',
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
        ? 'Production curatizability rollout checks passed. Curatizability coverage and curatization readiness signal signals are healthy.'
        : 'Production curatizability rollout is not ready. Resolve failed checks before relying on production curatizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SURVIVABILITY_TABLES = [
  'billing_records',
  'billing_meter_usage_reports',
  'workspace_usage_limits',
] as const

export type SurvivabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SurvivabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SurvivabilityRolloutCheck[]
  guidance: string
}

export type SurvivabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSurvivabilityTableCount: number
  billingRecordsTableExists: boolean
  billingMeterUsageReportsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateSurvivabilityRollout(
  input: SurvivabilityRolloutInput,
): SurvivabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const survivabilityTableCoverageComplete =
    input.existingSurvivabilityTableCount === CRITICAL_SURVIVABILITY_TABLES.length

  const checks: SurvivabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL survivability checks can reach the database.'
            : 'Production survivability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'survivability_signal_table_coverage',
      label: 'Survivability signal table coverage',
      status: survivabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Survivability signal table coverage is only enforced in production.'
          : survivabilityTableCoverageComplete
            ? `${input.existingSurvivabilityTableCount}/${CRITICAL_SURVIVABILITY_TABLES.length} survivability signal tables are present.`
            : `${input.existingSurvivabilityTableCount}/${CRITICAL_SURVIVABILITY_TABLES.length} survivability signal tables were found.`,
    },
    {
      name: 'billing_record_survivability',
      label: 'Billing record survivability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record survivability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record survivability signals.'
            : 'Production survivability rollout requires a billing_records table.',
    },
    {
      name: 'meter_usage_survivability',
      label: 'Meter usage survivability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage survivability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage survivability signals.'
            : 'Production survivability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'survival_readiness_signal',
      label: 'Survival readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          survivabilityTableCoverageComplete &&
          input.billingRecordsTableExists &&
          input.billingMeterUsageReportsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Survival readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              survivabilityTableCoverageComplete &&
              input.billingRecordsTableExists &&
              input.billingMeterUsageReportsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing records, meter usage reports, and workspace usage limits support survival readiness.'
            : 'Production survivability rollout requires PostgreSQL connectivity, survivability tables, billing record survivability, meter usage survivability, and full signal coverage.',
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
        ? 'Production survivability rollout checks passed. Survivability coverage and survival readiness signal signals are healthy.'
        : 'Production survivability rollout is not ready. Resolve failed checks before relying on production survivability tooling.',
  }
}

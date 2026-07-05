import type { ApiEnv } from '../config/env.js'

export const CRITICAL_COMPARABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_meter_usage_reports',
] as const

export type ComparabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ComparabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ComparabilityRolloutCheck[]
  guidance: string
}

export type ComparabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingComparabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingMeterUsageReportsTableExists: boolean
}

export function evaluateComparabilityRollout(
  input: ComparabilityRolloutInput,
): ComparabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const comparabilityTableCoverageComplete =
    input.existingComparabilityTableCount === CRITICAL_COMPARABILITY_TABLES.length

  const checks: ComparabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL comparability checks can reach the database.'
            : 'Production comparability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'comparability_signal_table_coverage',
      label: 'Comparability signal table coverage',
      status: comparabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Comparability signal table coverage is only enforced in production.'
          : comparabilityTableCoverageComplete
            ? `${input.existingComparabilityTableCount}/${CRITICAL_COMPARABILITY_TABLES.length} comparability signal tables are present.`
            : `${input.existingComparabilityTableCount}/${CRITICAL_COMPARABILITY_TABLES.length} comparability signal tables were found.`,
    },
    {
      name: 'billing_invoice_comparability',
      label: 'Billing invoice comparability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice comparability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice comparability signals.'
            : 'Production comparability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_comparability',
      label: 'Billing record comparability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record comparability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record comparability signals.'
            : 'Production comparability rollout requires a billing_records table.',
    },
    {
      name: 'comparison_readiness_signal',
      label: 'Comparison readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          comparabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingMeterUsageReportsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Comparison readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              comparabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingMeterUsageReportsTableExists
            ? 'Billing invoices, billing records, and meter usage reports support comparison readiness.'
            : 'Production comparability rollout requires PostgreSQL connectivity, comparability tables, billing invoice comparability, billing record comparability, and full signal coverage.',
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
        ? 'Production comparability rollout checks passed. Comparability coverage and comparison readiness signal signals are healthy.'
        : 'Production comparability rollout is not ready. Resolve failed checks before relying on production comparability tooling.',
  }
}

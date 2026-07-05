import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PROFITABILITY_TABLES = [
  'billing_records',
  'billing_invoices',
  'billing_meter_usage_reports',
] as const

export type ProfitabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ProfitabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ProfitabilityRolloutCheck[]
  guidance: string
}

export type ProfitabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingProfitabilityTableCount: number
  billingRecordsTableExists: boolean
  billingInvoicesTableExists: boolean
  billingMeterUsageReportsTableExists: boolean
}

export function evaluateProfitabilityRollout(
  input: ProfitabilityRolloutInput,
): ProfitabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const profitabilityTableCoverageComplete =
    input.existingProfitabilityTableCount === CRITICAL_PROFITABILITY_TABLES.length

  const checks: ProfitabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL profitability checks can reach the database.'
            : 'Production profitability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'profitability_signal_table_coverage',
      label: 'Profitability signal table coverage',
      status: profitabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Profitability signal table coverage is only enforced in production.'
          : profitabilityTableCoverageComplete
            ? `${input.existingProfitabilityTableCount}/${CRITICAL_PROFITABILITY_TABLES.length} profitability signal tables are present.`
            : `${input.existingProfitabilityTableCount}/${CRITICAL_PROFITABILITY_TABLES.length} profitability signal tables were found.`,
    },
    {
      name: 'billing_record_profitability',
      label: 'Billing record profitability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record profitability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record profitability signals.'
            : 'Production profitability rollout requires a billing_records table.',
    },
    {
      name: 'billing_invoice_profitability',
      label: 'Billing invoice profitability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice profitability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice profitability signals.'
            : 'Production profitability rollout requires a billing_invoices table.',
    },
    {
      name: 'profitability_readiness_signal',
      label: 'Profitability readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          profitabilityTableCoverageComplete &&
          input.billingRecordsTableExists &&
          input.billingInvoicesTableExists &&
          input.billingMeterUsageReportsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Profitability readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              profitabilityTableCoverageComplete &&
              input.billingRecordsTableExists &&
              input.billingInvoicesTableExists &&
              input.billingMeterUsageReportsTableExists
            ? 'Billing records, billing invoices, and meter usage reports support profitability readiness.'
            : 'Production profitability rollout requires PostgreSQL connectivity, profitability tables, billing record profitability, billing invoice profitability, and full signal coverage.',
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
        ? 'Production profitability rollout checks passed. Profitability coverage and profitability readiness signal signals are healthy.'
        : 'Production profitability rollout is not ready. Resolve failed checks before relying on production profitability tooling.',
  }
}

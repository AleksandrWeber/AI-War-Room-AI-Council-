import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CREDIBILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_meter_usage_reports',
] as const

export type CredibilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CredibilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CredibilityRolloutCheck[]
  guidance: string
}

export type CredibilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCredibilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingMeterUsageReportsTableExists: boolean
}

export function evaluateCredibilityRollout(
  input: CredibilityRolloutInput,
): CredibilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const credibilityTableCoverageComplete =
    input.existingCredibilityTableCount === CRITICAL_CREDIBILITY_TABLES.length

  const checks: CredibilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL credibility checks can reach the database.'
            : 'Production credibility rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'credibility_signal_table_coverage',
      label: 'Credibility signal table coverage',
      status: credibilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Credibility signal table coverage is only enforced in production.'
          : credibilityTableCoverageComplete
            ? `${input.existingCredibilityTableCount}/${CRITICAL_CREDIBILITY_TABLES.length} credibility signal tables are present.`
            : `${input.existingCredibilityTableCount}/${CRITICAL_CREDIBILITY_TABLES.length} credibility signal tables were found.`,
    },
    {
      name: 'billing_invoice_credibility',
      label: 'Billing invoice credibility',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice credibility is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice credibility signals.'
            : 'Production credibility rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_credibility',
      label: 'Billing record credibility',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record credibility is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record credibility signals.'
            : 'Production credibility rollout requires a billing_records table.',
    },
    {
      name: 'trust_readiness_signal',
      label: 'Trust readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          credibilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingMeterUsageReportsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Trust readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              credibilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingMeterUsageReportsTableExists
            ? 'Billing invoices, billing records, and meter usage reports support trust readiness.'
            : 'Production credibility rollout requires PostgreSQL connectivity, credibility tables, billing invoice credibility, billing record credibility, and full signal coverage.',
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
        ? 'Production credibility rollout checks passed. Credibility coverage and trust readiness signal signals are healthy.'
        : 'Production credibility rollout is not ready. Resolve failed checks before relying on production credibility tooling.',
  }
}

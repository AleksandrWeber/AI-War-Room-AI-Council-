import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SYMBOLIZABILITY_TABLES = [
  'billing_records',
  'billing_invoices',
  'usage_events',
] as const

export type SymbolizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SymbolizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SymbolizabilityRolloutCheck[]
  guidance: string
}

export type SymbolizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSymbolizabilityTableCount: number
  billingRecordsTableExists: boolean
  billingInvoicesTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateSymbolizabilityRollout(
  input: SymbolizabilityRolloutInput,
): SymbolizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const symbolizabilityTableCoverageComplete =
    input.existingSymbolizabilityTableCount === CRITICAL_SYMBOLIZABILITY_TABLES.length

  const checks: SymbolizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL symbolizability checks can reach the database.'
            : 'Production symbolizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'symbolizability_signal_table_coverage',
      label: 'Symbolizability signal table coverage',
      status: symbolizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Symbolizability signal table coverage is only enforced in production.'
          : symbolizabilityTableCoverageComplete
            ? `${input.existingSymbolizabilityTableCount}/${CRITICAL_SYMBOLIZABILITY_TABLES.length} symbolizability signal tables are present.`
            : `${input.existingSymbolizabilityTableCount}/${CRITICAL_SYMBOLIZABILITY_TABLES.length} symbolizability signal tables were found.`,
    },
    {
      name: 'billing_record_symbolizability',
      label: 'Billing record symbolizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record symbolizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record symbolizability signals.'
            : 'Production symbolizability rollout requires a billing_records table.',
    },
    {
      name: 'billing_invoice_symbolizability',
      label: 'Billing invoice symbolizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice symbolizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice symbolizability signals.'
            : 'Production symbolizability rollout requires a billing_invoices table.',
    },
    {
      name: 'symbolization_readiness_signal',
      label: 'Symbolization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          symbolizabilityTableCoverageComplete &&
          input.billingRecordsTableExists &&
          input.billingInvoicesTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Symbolization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              symbolizabilityTableCoverageComplete &&
              input.billingRecordsTableExists &&
              input.billingInvoicesTableExists &&
              input.usageEventsTableExists
            ? 'Billing records, billing invoices, and usage events support symbolization readiness.'
            : 'Production symbolizability rollout requires PostgreSQL connectivity, symbolizability tables, billing record symbolizability, billing invoice symbolizability, and full signal coverage.',
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
        ? 'Production symbolizability rollout checks passed. Symbolizability coverage and symbolization readiness signal signals are healthy.'
        : 'Production symbolizability rollout is not ready. Resolve failed checks before relying on production symbolizability tooling.',
  }
}

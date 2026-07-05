import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DECOMPRESSIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type DecompressizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DecompressizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DecompressizabilityRolloutCheck[]
  guidance: string
}

export type DecompressizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDecompressizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateDecompressizabilityRollout(
  input: DecompressizabilityRolloutInput,
): DecompressizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const decompressizabilityTableCoverageComplete =
    input.existingDecompressizabilityTableCount === CRITICAL_DECOMPRESSIZABILITY_TABLES.length

  const checks: DecompressizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL decompressizability checks can reach the database.'
            : 'Production decompressizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'decompressizability_signal_table_coverage',
      label: 'Decompressizability signal table coverage',
      status: decompressizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Decompressizability signal table coverage is only enforced in production.'
          : decompressizabilityTableCoverageComplete
            ? `${input.existingDecompressizabilityTableCount}/${CRITICAL_DECOMPRESSIZABILITY_TABLES.length} decompressizability signal tables are present.`
            : `${input.existingDecompressizabilityTableCount}/${CRITICAL_DECOMPRESSIZABILITY_TABLES.length} decompressizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_decompressizability',
      label: 'Billing invoice decompressizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice decompressizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice decompressizability signals.'
            : 'Production decompressizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_decompressizability',
      label: 'Billing record decompressizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record decompressizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record decompressizability signals.'
            : 'Production decompressizability rollout requires a billing_records table.',
    },
    {
      name: 'decompressization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          decompressizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              decompressizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support decompressization readiness.'
            : 'Production decompressizability rollout requires PostgreSQL connectivity, decompressizability tables, billing invoice decompressizability, billing record decompressizability, and full signal coverage.',
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
        ? 'Production decompressizability rollout checks passed. Decompressizability coverage and containerization readiness signal signals are healthy.'
        : 'Production decompressizability rollout is not ready. Resolve failed checks before relying on production decompressizability tooling.',
  }
}

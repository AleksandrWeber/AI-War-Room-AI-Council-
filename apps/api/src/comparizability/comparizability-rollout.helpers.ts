import type { ApiEnv } from '../config/env.js'

export const CRITICAL_COMPARIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type ComparizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ComparizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ComparizabilityRolloutCheck[]
  guidance: string
}

export type ComparizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingComparizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateComparizabilityRollout(
  input: ComparizabilityRolloutInput,
): ComparizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const comparizabilityTableCoverageComplete =
    input.existingComparizabilityTableCount === CRITICAL_COMPARIZABILITY_TABLES.length

  const checks: ComparizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL comparizability checks can reach the database.'
            : 'Production comparizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'comparizability_signal_table_coverage',
      label: 'Comparizability signal table coverage',
      status: comparizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Comparizability signal table coverage is only enforced in production.'
          : comparizabilityTableCoverageComplete
            ? `${input.existingComparizabilityTableCount}/${CRITICAL_COMPARIZABILITY_TABLES.length} comparizability signal tables are present.`
            : `${input.existingComparizabilityTableCount}/${CRITICAL_COMPARIZABILITY_TABLES.length} comparizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_comparizability',
      label: 'Billing invoice comparizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice comparizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice comparizability signals.'
            : 'Production comparizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_comparizability',
      label: 'Billing record comparizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record comparizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record comparizability signals.'
            : 'Production comparizability rollout requires a billing_records table.',
    },
    {
      name: 'comparization_readiness_signal',
      label: 'Comparization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          comparizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Comparization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              comparizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support comparization readiness.'
            : 'Production comparizability rollout requires PostgreSQL connectivity, comparizability tables, billing invoice comparizability, billing record comparizability, and full signal coverage.',
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
        ? 'Production comparizability rollout checks passed. Comparizability coverage and comparization readiness signal signals are healthy.'
        : 'Production comparizability rollout is not ready. Resolve failed checks before relying on production comparizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_NEGOTIABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type NegotiabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type NegotiabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: NegotiabilityRolloutCheck[]
  guidance: string
}

export type NegotiabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingNegotiabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateNegotiabilityRollout(
  input: NegotiabilityRolloutInput,
): NegotiabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const negotiabilityTableCoverageComplete =
    input.existingNegotiabilityTableCount === CRITICAL_NEGOTIABILITY_TABLES.length

  const checks: NegotiabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL negotiability checks can reach the database.'
            : 'Production negotiability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'negotiability_signal_table_coverage',
      label: 'Negotiability signal table coverage',
      status: negotiabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Negotiability signal table coverage is only enforced in production.'
          : negotiabilityTableCoverageComplete
            ? `${input.existingNegotiabilityTableCount}/${CRITICAL_NEGOTIABILITY_TABLES.length} negotiability signal tables are present.`
            : `${input.existingNegotiabilityTableCount}/${CRITICAL_NEGOTIABILITY_TABLES.length} negotiability signal tables were found.`,
    },
    {
      name: 'billing_invoice_negotiability',
      label: 'Billing invoice negotiability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice negotiability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice negotiability signals.'
            : 'Production negotiability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_negotiability',
      label: 'Billing record negotiability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record negotiability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record negotiability signals.'
            : 'Production negotiability rollout requires a billing_records table.',
    },
    {
      name: 'negotiation_readiness_signal',
      label: 'Negotiation readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          negotiabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Negotiation readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              negotiabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support negotiation readiness.'
            : 'Production negotiability rollout requires PostgreSQL connectivity, negotiability tables, billing invoice negotiability, billing record negotiability, and full signal coverage.',
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
        ? 'Production negotiability rollout checks passed. Negotiability coverage and negotiation readiness signal signals are healthy.'
        : 'Production negotiability rollout is not ready. Resolve failed checks before relying on production negotiability tooling.',
  }
}

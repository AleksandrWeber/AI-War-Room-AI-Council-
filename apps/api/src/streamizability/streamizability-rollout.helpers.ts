import type { ApiEnv } from '../config/env.js'

export const CRITICAL_STREAMIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type StreamizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type StreamizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: StreamizabilityRolloutCheck[]
  guidance: string
}

export type StreamizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingStreamizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateStreamizabilityRollout(
  input: StreamizabilityRolloutInput,
): StreamizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const streamizabilityTableCoverageComplete =
    input.existingStreamizabilityTableCount === CRITICAL_STREAMIZABILITY_TABLES.length

  const checks: StreamizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL streamizability checks can reach the database.'
            : 'Production streamizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'streamizability_signal_table_coverage',
      label: 'Streamizability signal table coverage',
      status: streamizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Streamizability signal table coverage is only enforced in production.'
          : streamizabilityTableCoverageComplete
            ? `${input.existingStreamizabilityTableCount}/${CRITICAL_STREAMIZABILITY_TABLES.length} streamizability signal tables are present.`
            : `${input.existingStreamizabilityTableCount}/${CRITICAL_STREAMIZABILITY_TABLES.length} streamizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_streamizability',
      label: 'Billing invoice streamizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice streamizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice streamizability signals.'
            : 'Production streamizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_streamizability',
      label: 'Billing record streamizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record streamizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record streamizability signals.'
            : 'Production streamizability rollout requires a billing_records table.',
    },
    {
      name: 'streamization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          streamizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              streamizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support streamization readiness.'
            : 'Production streamizability rollout requires PostgreSQL connectivity, streamizability tables, billing invoice streamizability, billing record streamizability, and full signal coverage.',
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
        ? 'Production streamizability rollout checks passed. Streamizability coverage and containerization readiness signal signals are healthy.'
        : 'Production streamizability rollout is not ready. Resolve failed checks before relying on production streamizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CONFIDENTIALITYIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type ConfidentialityizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ConfidentialityizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ConfidentialityizabilityRolloutCheck[]
  guidance: string
}

export type ConfidentialityizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingConfidentialityizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateConfidentialityizabilityRollout(
  input: ConfidentialityizabilityRolloutInput,
): ConfidentialityizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const confidentialityizabilityTableCoverageComplete =
    input.existingConfidentialityizabilityTableCount === CRITICAL_CONFIDENTIALITYIZABILITY_TABLES.length

  const checks: ConfidentialityizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL confidentialityizability checks can reach the database.'
            : 'Production confidentialityizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'confidentialityizability_signal_table_coverage',
      label: 'Confidentialityizability signal table coverage',
      status: confidentialityizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Confidentialityizability signal table coverage is only enforced in production.'
          : confidentialityizabilityTableCoverageComplete
            ? `${input.existingConfidentialityizabilityTableCount}/${CRITICAL_CONFIDENTIALITYIZABILITY_TABLES.length} confidentialityizability signal tables are present.`
            : `${input.existingConfidentialityizabilityTableCount}/${CRITICAL_CONFIDENTIALITYIZABILITY_TABLES.length} confidentialityizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_confidentialityizability',
      label: 'Billing invoice confidentialityizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice confidentialityizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice confidentialityizability signals.'
            : 'Production confidentialityizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_confidentialityizability',
      label: 'Billing record confidentialityizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record confidentialityizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record confidentialityizability signals.'
            : 'Production confidentialityizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          confidentialityizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              confidentialityizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production confidentialityizability rollout requires PostgreSQL connectivity, confidentialityizability tables, billing invoice confidentialityizability, billing record confidentialityizability, and full signal coverage.',
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
        ? 'Production confidentialityizability rollout checks passed. Confidentialityizability coverage and containerization readiness signal signals are healthy.'
        : 'Production confidentialityizability rollout is not ready. Resolve failed checks before relying on production confidentialityizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ATTRIBUTABILITYVAULTIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type AttributabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AttributabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AttributabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type AttributabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAttributabilityvaultizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateAttributabilityvaultizabilityRollout(
  input: AttributabilityvaultizabilityRolloutInput,
): AttributabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const attributabilityvaultizabilityTableCoverageComplete =
    input.existingAttributabilityvaultizabilityTableCount === CRITICAL_ATTRIBUTABILITYVAULTIZABILITY_TABLES.length

  const checks: AttributabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL attributabilityvaultizability checks can reach the database.'
            : 'Production attributabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'attributabilityvaultizability_signal_table_coverage',
      label: 'Attributabilityvaultizability signal table coverage',
      status: attributabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Attributabilityvaultizability signal table coverage is only enforced in production.'
          : attributabilityvaultizabilityTableCoverageComplete
            ? `${input.existingAttributabilityvaultizabilityTableCount}/${CRITICAL_ATTRIBUTABILITYVAULTIZABILITY_TABLES.length} attributabilityvaultizability signal tables are present.`
            : `${input.existingAttributabilityvaultizabilityTableCount}/${CRITICAL_ATTRIBUTABILITYVAULTIZABILITY_TABLES.length} attributabilityvaultizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_attributabilityvaultizability',
      label: 'Billing invoice attributabilityvaultizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice attributabilityvaultizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice attributabilityvaultizability signals.'
            : 'Production attributabilityvaultizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_attributabilityvaultizability',
      label: 'Billing record attributabilityvaultizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record attributabilityvaultizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record attributabilityvaultizability signals.'
            : 'Production attributabilityvaultizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          attributabilityvaultizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              attributabilityvaultizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production attributabilityvaultizability rollout requires PostgreSQL connectivity, attributabilityvaultizability tables, billing invoice attributabilityvaultizability, billing record attributabilityvaultizability, and full signal coverage.',
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
        ? 'Production attributabilityvaultizability rollout checks passed. Attributabilityvaultizability coverage and containerization readiness signal signals are healthy.'
        : 'Production attributabilityvaultizability rollout is not ready. Resolve failed checks before relying on production attributabilityvaultizability tooling.',
  }
}

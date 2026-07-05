import type { ApiEnv } from '../config/env.js'

export const CRITICAL_STYLIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type StylizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type StylizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: StylizabilityRolloutCheck[]
  guidance: string
}

export type StylizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingStylizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateStylizabilityRollout(
  input: StylizabilityRolloutInput,
): StylizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const stylizabilityTableCoverageComplete =
    input.existingStylizabilityTableCount === CRITICAL_STYLIZABILITY_TABLES.length

  const checks: StylizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL stylizability checks can reach the database.'
            : 'Production stylizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'stylizability_signal_table_coverage',
      label: 'Stylizability signal table coverage',
      status: stylizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Stylizability signal table coverage is only enforced in production.'
          : stylizabilityTableCoverageComplete
            ? `${input.existingStylizabilityTableCount}/${CRITICAL_STYLIZABILITY_TABLES.length} stylizability signal tables are present.`
            : `${input.existingStylizabilityTableCount}/${CRITICAL_STYLIZABILITY_TABLES.length} stylizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_stylizability',
      label: 'Billing invoice stylizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice stylizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice stylizability signals.'
            : 'Production stylizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_stylizability',
      label: 'Billing record stylizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record stylizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record stylizability signals.'
            : 'Production stylizability rollout requires a billing_records table.',
    },
    {
      name: 'stylization_readiness_signal',
      label: 'Stylization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          stylizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Stylization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              stylizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support stylization readiness.'
            : 'Production stylizability rollout requires PostgreSQL connectivity, stylizability tables, billing invoice stylizability, billing record stylizability, and full signal coverage.',
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
        ? 'Production stylizability rollout checks passed. Stylizability coverage and stylization readiness signal signals are healthy.'
        : 'Production stylizability rollout is not ready. Resolve failed checks before relying on production stylizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_INFERENCIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type InferencizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type InferencizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: InferencizabilityRolloutCheck[]
  guidance: string
}

export type InferencizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingInferencizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateInferencizabilityRollout(
  input: InferencizabilityRolloutInput,
): InferencizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const inferencizabilityTableCoverageComplete =
    input.existingInferencizabilityTableCount === CRITICAL_INFERENCIZABILITY_TABLES.length

  const checks: InferencizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL inferencizability checks can reach the database.'
            : 'Production inferencizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'inferencizability_signal_table_coverage',
      label: 'Inferencizability signal table coverage',
      status: inferencizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Inferencizability signal table coverage is only enforced in production.'
          : inferencizabilityTableCoverageComplete
            ? `${input.existingInferencizabilityTableCount}/${CRITICAL_INFERENCIZABILITY_TABLES.length} inferencizability signal tables are present.`
            : `${input.existingInferencizabilityTableCount}/${CRITICAL_INFERENCIZABILITY_TABLES.length} inferencizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_inferencizability',
      label: 'Billing invoice inferencizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice inferencizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice inferencizability signals.'
            : 'Production inferencizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_inferencizability',
      label: 'Billing record inferencizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record inferencizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record inferencizability signals.'
            : 'Production inferencizability rollout requires a billing_records table.',
    },
    {
      name: 'inferencization_readiness_signal',
      label: 'Inferencization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          inferencizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Inferencization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              inferencizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support inferencization readiness.'
            : 'Production inferencizability rollout requires PostgreSQL connectivity, inferencizability tables, billing invoice inferencizability, billing record inferencizability, and full signal coverage.',
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
        ? 'Production inferencizability rollout checks passed. Inferencizability coverage and inferencization readiness signal signals are healthy.'
        : 'Production inferencizability rollout is not ready. Resolve failed checks before relying on production inferencizability tooling.',
  }
}

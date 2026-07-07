import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ASSURANCEVAULTIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type AssurancevaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AssurancevaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AssurancevaultizabilityRolloutCheck[]
  guidance: string
}

export type AssurancevaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAssurancevaultizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateAssurancevaultizabilityRollout(
  input: AssurancevaultizabilityRolloutInput,
): AssurancevaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const assurancevaultizabilityTableCoverageComplete =
    input.existingAssurancevaultizabilityTableCount === CRITICAL_ASSURANCEVAULTIZABILITY_TABLES.length

  const checks: AssurancevaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL assurancevaultizability checks can reach the database.'
            : 'Production assurancevaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'assurancevaultizability_signal_table_coverage',
      label: 'Assurancevaultizability signal table coverage',
      status: assurancevaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Assurancevaultizability signal table coverage is only enforced in production.'
          : assurancevaultizabilityTableCoverageComplete
            ? `${input.existingAssurancevaultizabilityTableCount}/${CRITICAL_ASSURANCEVAULTIZABILITY_TABLES.length} assurancevaultizability signal tables are present.`
            : `${input.existingAssurancevaultizabilityTableCount}/${CRITICAL_ASSURANCEVAULTIZABILITY_TABLES.length} assurancevaultizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_assurancevaultizability',
      label: 'Billing invoice assurancevaultizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice assurancevaultizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice assurancevaultizability signals.'
            : 'Production assurancevaultizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_assurancevaultizability',
      label: 'Billing record assurancevaultizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record assurancevaultizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record assurancevaultizability signals.'
            : 'Production assurancevaultizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          assurancevaultizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              assurancevaultizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production assurancevaultizability rollout requires PostgreSQL connectivity, assurancevaultizability tables, billing invoice assurancevaultizability, billing record assurancevaultizability, and full signal coverage.',
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
        ? 'Production assurancevaultizability rollout checks passed. Assurancevaultizability coverage and containerization readiness signal signals are healthy.'
        : 'Production assurancevaultizability rollout is not ready. Resolve failed checks before relying on production assurancevaultizability tooling.',
  }
}

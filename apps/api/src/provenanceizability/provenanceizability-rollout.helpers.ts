import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PROVENANCEIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type ProvenanceizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ProvenanceizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ProvenanceizabilityRolloutCheck[]
  guidance: string
}

export type ProvenanceizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingProvenanceizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateProvenanceizabilityRollout(
  input: ProvenanceizabilityRolloutInput,
): ProvenanceizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const provenanceizabilityTableCoverageComplete =
    input.existingProvenanceizabilityTableCount === CRITICAL_PROVENANCEIZABILITY_TABLES.length

  const checks: ProvenanceizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL provenanceizability checks can reach the database.'
            : 'Production provenanceizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'provenanceizability_signal_table_coverage',
      label: 'Provenanceizability signal table coverage',
      status: provenanceizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provenanceizability signal table coverage is only enforced in production.'
          : provenanceizabilityTableCoverageComplete
            ? `${input.existingProvenanceizabilityTableCount}/${CRITICAL_PROVENANCEIZABILITY_TABLES.length} provenanceizability signal tables are present.`
            : `${input.existingProvenanceizabilityTableCount}/${CRITICAL_PROVENANCEIZABILITY_TABLES.length} provenanceizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_provenanceizability',
      label: 'Billing invoice provenanceizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice provenanceizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice provenanceizability signals.'
            : 'Production provenanceizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_provenanceizability',
      label: 'Billing record provenanceizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record provenanceizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record provenanceizability signals.'
            : 'Production provenanceizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          provenanceizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              provenanceizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production provenanceizability rollout requires PostgreSQL connectivity, provenanceizability tables, billing invoice provenanceizability, billing record provenanceizability, and full signal coverage.',
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
        ? 'Production provenanceizability rollout checks passed. Provenanceizability coverage and containerization readiness signal signals are healthy.'
        : 'Production provenanceizability rollout is not ready. Resolve failed checks before relying on production provenanceizability tooling.',
  }
}

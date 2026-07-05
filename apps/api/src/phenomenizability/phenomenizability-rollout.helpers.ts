import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PHENOMENIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type PhenomenizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type PhenomenizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: PhenomenizabilityRolloutCheck[]
  guidance: string
}

export type PhenomenizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingPhenomenizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluatePhenomenizabilityRollout(
  input: PhenomenizabilityRolloutInput,
): PhenomenizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const phenomenizabilityTableCoverageComplete =
    input.existingPhenomenizabilityTableCount === CRITICAL_PHENOMENIZABILITY_TABLES.length

  const checks: PhenomenizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL phenomenizability checks can reach the database.'
            : 'Production phenomenizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'phenomenizability_signal_table_coverage',
      label: 'Phenomenizability signal table coverage',
      status: phenomenizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Phenomenizability signal table coverage is only enforced in production.'
          : phenomenizabilityTableCoverageComplete
            ? `${input.existingPhenomenizabilityTableCount}/${CRITICAL_PHENOMENIZABILITY_TABLES.length} phenomenizability signal tables are present.`
            : `${input.existingPhenomenizabilityTableCount}/${CRITICAL_PHENOMENIZABILITY_TABLES.length} phenomenizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_phenomenizability',
      label: 'Billing invoice phenomenizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice phenomenizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice phenomenizability signals.'
            : 'Production phenomenizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_phenomenizability',
      label: 'Billing record phenomenizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record phenomenizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record phenomenizability signals.'
            : 'Production phenomenizability rollout requires a billing_records table.',
    },
    {
      name: 'phenomenization_readiness_signal',
      label: 'Phenomenization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          phenomenizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Phenomenization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              phenomenizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support phenomenization readiness.'
            : 'Production phenomenizability rollout requires PostgreSQL connectivity, phenomenizability tables, billing invoice phenomenizability, billing record phenomenizability, and full signal coverage.',
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
        ? 'Production phenomenizability rollout checks passed. Phenomenizability coverage and phenomenization readiness signal signals are healthy.'
        : 'Production phenomenizability rollout is not ready. Resolve failed checks before relying on production phenomenizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_REPRESENTABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type RepresentabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RepresentabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RepresentabilityRolloutCheck[]
  guidance: string
}

export type RepresentabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRepresentabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateRepresentabilityRollout(
  input: RepresentabilityRolloutInput,
): RepresentabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const representabilityTableCoverageComplete =
    input.existingRepresentabilityTableCount === CRITICAL_REPRESENTABILITY_TABLES.length

  const checks: RepresentabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL representability checks can reach the database.'
            : 'Production representability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'representability_signal_table_coverage',
      label: 'Representability signal table coverage',
      status: representabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Representability signal table coverage is only enforced in production.'
          : representabilityTableCoverageComplete
            ? `${input.existingRepresentabilityTableCount}/${CRITICAL_REPRESENTABILITY_TABLES.length} representability signal tables are present.`
            : `${input.existingRepresentabilityTableCount}/${CRITICAL_REPRESENTABILITY_TABLES.length} representability signal tables were found.`,
    },
    {
      name: 'billing_invoice_representability',
      label: 'Billing invoice representability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice representability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice representability signals.'
            : 'Production representability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_representability',
      label: 'Billing record representability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record representability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record representability signals.'
            : 'Production representability rollout requires a billing_records table.',
    },
    {
      name: 'representation_readiness_signal',
      label: 'Representation readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          representabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Representation readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              representabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support representation readiness.'
            : 'Production representability rollout requires PostgreSQL connectivity, representability tables, billing invoice representability, billing record representability, and full signal coverage.',
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
        ? 'Production representability rollout checks passed. Representability coverage and representation readiness signal signals are healthy.'
        : 'Production representability rollout is not ready. Resolve failed checks before relying on production representability tooling.',
  }
}

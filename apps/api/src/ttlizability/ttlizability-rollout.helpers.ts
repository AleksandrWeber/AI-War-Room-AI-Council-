import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TTLIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type TtlizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TtlizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TtlizabilityRolloutCheck[]
  guidance: string
}

export type TtlizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTtlizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateTtlizabilityRollout(
  input: TtlizabilityRolloutInput,
): TtlizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const ttlizabilityTableCoverageComplete =
    input.existingTtlizabilityTableCount === CRITICAL_TTLIZABILITY_TABLES.length

  const checks: TtlizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL ttlizability checks can reach the database.'
            : 'Production ttlizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'ttlizability_signal_table_coverage',
      label: 'Ttlizability signal table coverage',
      status: ttlizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Ttlizability signal table coverage is only enforced in production.'
          : ttlizabilityTableCoverageComplete
            ? `${input.existingTtlizabilityTableCount}/${CRITICAL_TTLIZABILITY_TABLES.length} ttlizability signal tables are present.`
            : `${input.existingTtlizabilityTableCount}/${CRITICAL_TTLIZABILITY_TABLES.length} ttlizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_ttlizability',
      label: 'Billing invoice ttlizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice ttlizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice ttlizability signals.'
            : 'Production ttlizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_ttlizability',
      label: 'Billing record ttlizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record ttlizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record ttlizability signals.'
            : 'Production ttlizability rollout requires a billing_records table.',
    },
    {
      name: 'ttlization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          ttlizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              ttlizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support ttlization readiness.'
            : 'Production ttlizability rollout requires PostgreSQL connectivity, ttlizability tables, billing invoice ttlizability, billing record ttlizability, and full signal coverage.',
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
        ? 'Production ttlizability rollout checks passed. Ttlizability coverage and containerization readiness signal signals are healthy.'
        : 'Production ttlizability rollout is not ready. Resolve failed checks before relying on production ttlizability tooling.',
  }
}

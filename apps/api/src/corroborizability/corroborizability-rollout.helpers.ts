import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CORROBORIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type CorroborizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CorroborizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CorroborizabilityRolloutCheck[]
  guidance: string
}

export type CorroborizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCorroborizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateCorroborizabilityRollout(
  input: CorroborizabilityRolloutInput,
): CorroborizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const corroborizabilityTableCoverageComplete =
    input.existingCorroborizabilityTableCount === CRITICAL_CORROBORIZABILITY_TABLES.length

  const checks: CorroborizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL corroborizability checks can reach the database.'
            : 'Production corroborizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'corroborizability_signal_table_coverage',
      label: 'Corroborizability signal table coverage',
      status: corroborizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Corroborizability signal table coverage is only enforced in production.'
          : corroborizabilityTableCoverageComplete
            ? `${input.existingCorroborizabilityTableCount}/${CRITICAL_CORROBORIZABILITY_TABLES.length} corroborizability signal tables are present.`
            : `${input.existingCorroborizabilityTableCount}/${CRITICAL_CORROBORIZABILITY_TABLES.length} corroborizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_corroborizability',
      label: 'Billing invoice corroborizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice corroborizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice corroborizability signals.'
            : 'Production corroborizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_corroborizability',
      label: 'Billing record corroborizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record corroborizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record corroborizability signals.'
            : 'Production corroborizability rollout requires a billing_records table.',
    },
    {
      name: 'corroborization_readiness_signal',
      label: 'Corroborization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          corroborizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Corroborization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              corroborizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support corroborization readiness.'
            : 'Production corroborizability rollout requires PostgreSQL connectivity, corroborizability tables, billing invoice corroborizability, billing record corroborizability, and full signal coverage.',
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
        ? 'Production corroborizability rollout checks passed. Corroborizability coverage and corroborization readiness signal signals are healthy.'
        : 'Production corroborizability rollout is not ready. Resolve failed checks before relying on production corroborizability tooling.',
  }
}

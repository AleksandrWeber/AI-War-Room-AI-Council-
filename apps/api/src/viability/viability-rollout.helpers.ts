import type { ApiEnv } from '../config/env.js'

export const CRITICAL_VIABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_notifications',
] as const

export type ViabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ViabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ViabilityRolloutCheck[]
  guidance: string
}

export type ViabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingViabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateViabilityRollout(
  input: ViabilityRolloutInput,
): ViabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const viabilityTableCoverageComplete =
    input.existingViabilityTableCount === CRITICAL_VIABILITY_TABLES.length

  const checks: ViabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL viability checks can reach the database.'
            : 'Production viability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'viability_signal_table_coverage',
      label: 'Viability signal table coverage',
      status: viabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Viability signal table coverage is only enforced in production.'
          : viabilityTableCoverageComplete
            ? `${input.existingViabilityTableCount}/${CRITICAL_VIABILITY_TABLES.length} viability signal tables are present.`
            : `${input.existingViabilityTableCount}/${CRITICAL_VIABILITY_TABLES.length} viability signal tables were found.`,
    },
    {
      name: 'billing_invoice_viability',
      label: 'Billing invoice viability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice viability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice viability signals.'
            : 'Production viability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_viability',
      label: 'Billing record viability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record viability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record viability signals.'
            : 'Production viability rollout requires a billing_records table.',
    },
    {
      name: 'viability_readiness_signal',
      label: 'Viability readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          viabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Viability readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              viabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingNotificationsTableExists
            ? 'Billing invoices, billing records, and billing notifications support viability readiness.'
            : 'Production viability rollout requires PostgreSQL connectivity, viability tables, billing invoice viability, billing record viability, and full signal coverage.',
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
        ? 'Production viability rollout checks passed. Viability coverage and viability readiness signal signals are healthy.'
        : 'Production viability rollout is not ready. Resolve failed checks before relying on production viability tooling.',
  }
}

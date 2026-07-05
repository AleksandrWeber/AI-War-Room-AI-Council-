import type { ApiEnv } from '../config/env.js'

export const CRITICAL_APPROPRIATENESS_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_notifications',
] as const

export type AppropriatenessRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AppropriatenessRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AppropriatenessRolloutCheck[]
  guidance: string
}

export type AppropriatenessRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAppropriatenessTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateAppropriatenessRollout(
  input: AppropriatenessRolloutInput,
): AppropriatenessRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const appropriatenessTableCoverageComplete =
    input.existingAppropriatenessTableCount === CRITICAL_APPROPRIATENESS_TABLES.length

  const checks: AppropriatenessRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL appropriateness checks can reach the database.'
            : 'Production appropriateness rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'appropriateness_signal_table_coverage',
      label: 'Appropriateness signal table coverage',
      status: appropriatenessTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Appropriateness signal table coverage is only enforced in production.'
          : appropriatenessTableCoverageComplete
            ? `${input.existingAppropriatenessTableCount}/${CRITICAL_APPROPRIATENESS_TABLES.length} appropriateness signal tables are present.`
            : `${input.existingAppropriatenessTableCount}/${CRITICAL_APPROPRIATENESS_TABLES.length} appropriateness signal tables were found.`,
    },
    {
      name: 'billing_invoice_appropriateness',
      label: 'Billing invoice appropriateness',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice appropriateness is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice appropriateness signals.'
            : 'Production appropriateness rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_appropriateness',
      label: 'Billing record appropriateness',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record appropriateness is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record appropriateness signals.'
            : 'Production appropriateness rollout requires a billing_records table.',
    },
    {
      name: 'appropriateness_readiness_signal',
      label: 'Appropriateness readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          appropriatenessTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Appropriateness readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              appropriatenessTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingNotificationsTableExists
            ? 'Billing invoices, billing records, and billing notifications support appropriateness readiness.'
            : 'Production appropriateness rollout requires PostgreSQL connectivity, appropriateness tables, billing invoice appropriateness, billing record appropriateness, and full signal coverage.',
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
        ? 'Production appropriateness rollout checks passed. Appropriateness coverage and appropriateness readiness signal signals are healthy.'
        : 'Production appropriateness rollout is not ready. Resolve failed checks before relying on production appropriateness tooling.',
  }
}

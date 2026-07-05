import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SCHEDULIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type SchedulizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SchedulizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SchedulizabilityRolloutCheck[]
  guidance: string
}

export type SchedulizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSchedulizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateSchedulizabilityRollout(
  input: SchedulizabilityRolloutInput,
): SchedulizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const schedulizabilityTableCoverageComplete =
    input.existingSchedulizabilityTableCount === CRITICAL_SCHEDULIZABILITY_TABLES.length

  const checks: SchedulizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL schedulizability checks can reach the database.'
            : 'Production schedulizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'schedulizability_signal_table_coverage',
      label: 'Schedulizability signal table coverage',
      status: schedulizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Schedulizability signal table coverage is only enforced in production.'
          : schedulizabilityTableCoverageComplete
            ? `${input.existingSchedulizabilityTableCount}/${CRITICAL_SCHEDULIZABILITY_TABLES.length} schedulizability signal tables are present.`
            : `${input.existingSchedulizabilityTableCount}/${CRITICAL_SCHEDULIZABILITY_TABLES.length} schedulizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_schedulizability',
      label: 'Billing invoice schedulizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice schedulizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice schedulizability signals.'
            : 'Production schedulizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_schedulizability',
      label: 'Billing record schedulizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record schedulizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record schedulizability signals.'
            : 'Production schedulizability rollout requires a billing_records table.',
    },
    {
      name: 'schedulization_readiness_signal',
      label: 'Schedulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          schedulizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Schedulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              schedulizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support schedulization readiness.'
            : 'Production schedulizability rollout requires PostgreSQL connectivity, schedulizability tables, billing invoice schedulizability, billing record schedulizability, and full signal coverage.',
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
        ? 'Production schedulizability rollout checks passed. Schedulizability coverage and schedulization readiness signal signals are healthy.'
        : 'Production schedulizability rollout is not ready. Resolve failed checks before relying on production schedulizability tooling.',
  }
}

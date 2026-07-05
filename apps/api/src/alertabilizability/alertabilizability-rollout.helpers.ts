import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ALERTABILIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type AlertabilizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AlertabilizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AlertabilizabilityRolloutCheck[]
  guidance: string
}

export type AlertabilizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAlertabilizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateAlertabilizabilityRollout(
  input: AlertabilizabilityRolloutInput,
): AlertabilizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const alertabilizabilityTableCoverageComplete =
    input.existingAlertabilizabilityTableCount === CRITICAL_ALERTABILIZABILITY_TABLES.length

  const checks: AlertabilizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL alertabilizability checks can reach the database.'
            : 'Production alertabilizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'alertabilizability_signal_table_coverage',
      label: 'Alertabilizability signal table coverage',
      status: alertabilizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Alertabilizability signal table coverage is only enforced in production.'
          : alertabilizabilityTableCoverageComplete
            ? `${input.existingAlertabilizabilityTableCount}/${CRITICAL_ALERTABILIZABILITY_TABLES.length} alertabilizability signal tables are present.`
            : `${input.existingAlertabilizabilityTableCount}/${CRITICAL_ALERTABILIZABILITY_TABLES.length} alertabilizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_alertabilizability',
      label: 'Billing invoice alertabilizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice alertabilizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice alertabilizability signals.'
            : 'Production alertabilizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_alertabilizability',
      label: 'Billing record alertabilizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record alertabilizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record alertabilizability signals.'
            : 'Production alertabilizability rollout requires a billing_records table.',
    },
    {
      name: 'alertabilization_readiness_signal',
      label: 'Alertabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          alertabilizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Alertabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              alertabilizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support alertabilization readiness.'
            : 'Production alertabilizability rollout requires PostgreSQL connectivity, alertabilizability tables, billing invoice alertabilizability, billing record alertabilizability, and full signal coverage.',
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
        ? 'Production alertabilizability rollout checks passed. Alertabilizability coverage and alertabilization readiness signal signals are healthy.'
        : 'Production alertabilizability rollout is not ready. Resolve failed checks before relying on production alertabilizability tooling.',
  }
}

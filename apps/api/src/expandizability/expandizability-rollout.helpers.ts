import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DECOMPACTIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type ExpandizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ExpandizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ExpandizabilityRolloutCheck[]
  guidance: string
}

export type ExpandizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingExpandizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateExpandizabilityRollout(
  input: ExpandizabilityRolloutInput,
): ExpandizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const expandizabilityTableCoverageComplete =
    input.existingExpandizabilityTableCount === CRITICAL_DECOMPACTIZABILITY_TABLES.length

  const checks: ExpandizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL expandizability checks can reach the database.'
            : 'Production expandizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'expandizability_signal_table_coverage',
      label: 'Expandizability signal table coverage',
      status: expandizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Expandizability signal table coverage is only enforced in production.'
          : expandizabilityTableCoverageComplete
            ? `${input.existingExpandizabilityTableCount}/${CRITICAL_DECOMPACTIZABILITY_TABLES.length} expandizability signal tables are present.`
            : `${input.existingExpandizabilityTableCount}/${CRITICAL_DECOMPACTIZABILITY_TABLES.length} expandizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_expandizability',
      label: 'Billing invoice expandizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice expandizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice expandizability signals.'
            : 'Production expandizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_expandizability',
      label: 'Billing record expandizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record expandizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record expandizability signals.'
            : 'Production expandizability rollout requires a billing_records table.',
    },
    {
      name: 'expandization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          expandizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              expandizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support expandization readiness.'
            : 'Production expandizability rollout requires PostgreSQL connectivity, expandizability tables, billing invoice expandizability, billing record expandizability, and full signal coverage.',
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
        ? 'Production expandizability rollout checks passed. Expandizability coverage and containerization readiness signal signals are healthy.'
        : 'Production expandizability rollout is not ready. Resolve failed checks before relying on production expandizability tooling.',
  }
}

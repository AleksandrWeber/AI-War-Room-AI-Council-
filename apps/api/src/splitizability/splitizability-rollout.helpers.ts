import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SPLITIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type SplitizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SplitizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SplitizabilityRolloutCheck[]
  guidance: string
}

export type SplitizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSplitizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateSplitizabilityRollout(
  input: SplitizabilityRolloutInput,
): SplitizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const splitizabilityTableCoverageComplete =
    input.existingSplitizabilityTableCount === CRITICAL_SPLITIZABILITY_TABLES.length

  const checks: SplitizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL splitizability checks can reach the database.'
            : 'Production splitizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'splitizability_signal_table_coverage',
      label: 'Splitizability signal table coverage',
      status: splitizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Splitizability signal table coverage is only enforced in production.'
          : splitizabilityTableCoverageComplete
            ? `${input.existingSplitizabilityTableCount}/${CRITICAL_SPLITIZABILITY_TABLES.length} splitizability signal tables are present.`
            : `${input.existingSplitizabilityTableCount}/${CRITICAL_SPLITIZABILITY_TABLES.length} splitizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_splitizability',
      label: 'Billing invoice splitizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice splitizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice splitizability signals.'
            : 'Production splitizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_splitizability',
      label: 'Billing record splitizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record splitizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record splitizability signals.'
            : 'Production splitizability rollout requires a billing_records table.',
    },
    {
      name: 'splitization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          splitizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              splitizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support splitization readiness.'
            : 'Production splitizability rollout requires PostgreSQL connectivity, splitizability tables, billing invoice splitizability, billing record splitizability, and full signal coverage.',
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
        ? 'Production splitizability rollout checks passed. Splitizability coverage and containerization readiness signal signals are healthy.'
        : 'Production splitizability rollout is not ready. Resolve failed checks before relying on production splitizability tooling.',
  }
}

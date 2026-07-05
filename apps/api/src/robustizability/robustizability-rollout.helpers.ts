import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ROBUSTIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type RobustizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RobustizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RobustizabilityRolloutCheck[]
  guidance: string
}

export type RobustizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRobustizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateRobustizabilityRollout(
  input: RobustizabilityRolloutInput,
): RobustizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const robustizabilityTableCoverageComplete =
    input.existingRobustizabilityTableCount === CRITICAL_ROBUSTIZABILITY_TABLES.length

  const checks: RobustizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL robustizability checks can reach the database.'
            : 'Production robustizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'robustizability_signal_table_coverage',
      label: 'Robustizability signal table coverage',
      status: robustizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Robustizability signal table coverage is only enforced in production.'
          : robustizabilityTableCoverageComplete
            ? `${input.existingRobustizabilityTableCount}/${CRITICAL_ROBUSTIZABILITY_TABLES.length} robustizability signal tables are present.`
            : `${input.existingRobustizabilityTableCount}/${CRITICAL_ROBUSTIZABILITY_TABLES.length} robustizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_robustizability',
      label: 'Billing invoice robustizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice robustizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice robustizability signals.'
            : 'Production robustizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_robustizability',
      label: 'Billing record robustizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record robustizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record robustizability signals.'
            : 'Production robustizability rollout requires a billing_records table.',
    },
    {
      name: 'robustization_readiness_signal',
      label: 'Robustization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          robustizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Robustization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              robustizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support robustization readiness.'
            : 'Production robustizability rollout requires PostgreSQL connectivity, robustizability tables, billing invoice robustizability, billing record robustizability, and full signal coverage.',
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
        ? 'Production robustizability rollout checks passed. Robustizability coverage and robustization readiness signal signals are healthy.'
        : 'Production robustizability rollout is not ready. Resolve failed checks before relying on production robustizability tooling.',
  }
}

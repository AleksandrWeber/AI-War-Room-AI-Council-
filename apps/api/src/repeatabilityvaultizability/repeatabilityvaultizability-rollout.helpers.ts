import type { ApiEnv } from '../config/env.js'

export const CRITICAL_REPEATABILITYVAULTIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type RepeatabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RepeatabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RepeatabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type RepeatabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRepeatabilityvaultizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateRepeatabilityvaultizabilityRollout(
  input: RepeatabilityvaultizabilityRolloutInput,
): RepeatabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const repeatabilityvaultizabilityTableCoverageComplete =
    input.existingRepeatabilityvaultizabilityTableCount === CRITICAL_REPEATABILITYVAULTIZABILITY_TABLES.length

  const checks: RepeatabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL repeatabilityvaultizability checks can reach the database.'
            : 'Production repeatabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'repeatabilityvaultizability_signal_table_coverage',
      label: 'Repeatabilityvaultizability signal table coverage',
      status: repeatabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Repeatabilityvaultizability signal table coverage is only enforced in production.'
          : repeatabilityvaultizabilityTableCoverageComplete
            ? `${input.existingRepeatabilityvaultizabilityTableCount}/${CRITICAL_REPEATABILITYVAULTIZABILITY_TABLES.length} repeatabilityvaultizability signal tables are present.`
            : `${input.existingRepeatabilityvaultizabilityTableCount}/${CRITICAL_REPEATABILITYVAULTIZABILITY_TABLES.length} repeatabilityvaultizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_repeatabilityvaultizability',
      label: 'Billing invoice repeatabilityvaultizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice repeatabilityvaultizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice repeatabilityvaultizability signals.'
            : 'Production repeatabilityvaultizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_repeatabilityvaultizability',
      label: 'Billing record repeatabilityvaultizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record repeatabilityvaultizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record repeatabilityvaultizability signals.'
            : 'Production repeatabilityvaultizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          repeatabilityvaultizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              repeatabilityvaultizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production repeatabilityvaultizability rollout requires PostgreSQL connectivity, repeatabilityvaultizability tables, billing invoice repeatabilityvaultizability, billing record repeatabilityvaultizability, and full signal coverage.',
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
        ? 'Production repeatabilityvaultizability rollout checks passed. Repeatabilityvaultizability coverage and containerization readiness signal signals are healthy.'
        : 'Production repeatabilityvaultizability rollout is not ready. Resolve failed checks before relying on production repeatabilityvaultizability tooling.',
  }
}

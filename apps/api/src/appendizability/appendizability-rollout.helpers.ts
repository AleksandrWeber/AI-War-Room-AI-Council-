import type { ApiEnv } from '../config/env.js'

export const CRITICAL_APPENDIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type AppendizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AppendizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AppendizabilityRolloutCheck[]
  guidance: string
}

export type AppendizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAppendizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateAppendizabilityRollout(
  input: AppendizabilityRolloutInput,
): AppendizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const appendizabilityTableCoverageComplete =
    input.existingAppendizabilityTableCount === CRITICAL_APPENDIZABILITY_TABLES.length

  const checks: AppendizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL appendizability checks can reach the database.'
            : 'Production appendizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'appendizability_signal_table_coverage',
      label: 'Appendizability signal table coverage',
      status: appendizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Appendizability signal table coverage is only enforced in production.'
          : appendizabilityTableCoverageComplete
            ? `${input.existingAppendizabilityTableCount}/${CRITICAL_APPENDIZABILITY_TABLES.length} appendizability signal tables are present.`
            : `${input.existingAppendizabilityTableCount}/${CRITICAL_APPENDIZABILITY_TABLES.length} appendizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_appendizability',
      label: 'Billing invoice appendizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice appendizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice appendizability signals.'
            : 'Production appendizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_appendizability',
      label: 'Billing record appendizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record appendizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record appendizability signals.'
            : 'Production appendizability rollout requires a billing_records table.',
    },
    {
      name: 'appendization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          appendizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              appendizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support appendization readiness.'
            : 'Production appendizability rollout requires PostgreSQL connectivity, appendizability tables, billing invoice appendizability, billing record appendizability, and full signal coverage.',
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
        ? 'Production appendizability rollout checks passed. Appendizability coverage and containerization readiness signal signals are healthy.'
        : 'Production appendizability rollout is not ready. Resolve failed checks before relying on production appendizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SEMANTICIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type SemanticizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SemanticizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SemanticizabilityRolloutCheck[]
  guidance: string
}

export type SemanticizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSemanticizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateSemanticizabilityRollout(
  input: SemanticizabilityRolloutInput,
): SemanticizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const semanticizabilityTableCoverageComplete =
    input.existingSemanticizabilityTableCount === CRITICAL_SEMANTICIZABILITY_TABLES.length

  const checks: SemanticizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL semanticizability checks can reach the database.'
            : 'Production semanticizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'semanticizability_signal_table_coverage',
      label: 'Semanticizability signal table coverage',
      status: semanticizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Semanticizability signal table coverage is only enforced in production.'
          : semanticizabilityTableCoverageComplete
            ? `${input.existingSemanticizabilityTableCount}/${CRITICAL_SEMANTICIZABILITY_TABLES.length} semanticizability signal tables are present.`
            : `${input.existingSemanticizabilityTableCount}/${CRITICAL_SEMANTICIZABILITY_TABLES.length} semanticizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_semanticizability',
      label: 'Billing invoice semanticizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice semanticizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice semanticizability signals.'
            : 'Production semanticizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_semanticizability',
      label: 'Billing record semanticizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record semanticizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record semanticizability signals.'
            : 'Production semanticizability rollout requires a billing_records table.',
    },
    {
      name: 'semanticization_readiness_signal',
      label: 'Semanticization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          semanticizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Semanticization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              semanticizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support semanticization readiness.'
            : 'Production semanticizability rollout requires PostgreSQL connectivity, semanticizability tables, billing invoice semanticizability, billing record semanticizability, and full signal coverage.',
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
        ? 'Production semanticizability rollout checks passed. Semanticizability coverage and semanticization readiness signal signals are healthy.'
        : 'Production semanticizability rollout is not ready. Resolve failed checks before relying on production semanticizability tooling.',
  }
}

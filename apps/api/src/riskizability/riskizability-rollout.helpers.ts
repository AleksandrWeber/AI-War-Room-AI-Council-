import type { ApiEnv } from '../config/env.js'

export const CRITICAL_RISKIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type RiskizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RiskizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RiskizabilityRolloutCheck[]
  guidance: string
}

export type RiskizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRiskizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateRiskizabilityRollout(
  input: RiskizabilityRolloutInput,
): RiskizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const riskizabilityTableCoverageComplete =
    input.existingRiskizabilityTableCount === CRITICAL_RISKIZABILITY_TABLES.length

  const checks: RiskizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL riskizability checks can reach the database.'
            : 'Production riskizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'riskizability_signal_table_coverage',
      label: 'Riskizability signal table coverage',
      status: riskizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Riskizability signal table coverage is only enforced in production.'
          : riskizabilityTableCoverageComplete
            ? `${input.existingRiskizabilityTableCount}/${CRITICAL_RISKIZABILITY_TABLES.length} riskizability signal tables are present.`
            : `${input.existingRiskizabilityTableCount}/${CRITICAL_RISKIZABILITY_TABLES.length} riskizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_riskizability',
      label: 'Billing invoice riskizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice riskizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice riskizability signals.'
            : 'Production riskizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_riskizability',
      label: 'Billing record riskizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record riskizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record riskizability signals.'
            : 'Production riskizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          riskizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              riskizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production riskizability rollout requires PostgreSQL connectivity, riskizability tables, billing invoice riskizability, billing record riskizability, and full signal coverage.',
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
        ? 'Production riskizability rollout checks passed. Riskizability coverage and containerization readiness signal signals are healthy.'
        : 'Production riskizability rollout is not ready. Resolve failed checks before relying on production riskizability tooling.',
  }
}

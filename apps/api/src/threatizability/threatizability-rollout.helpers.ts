import type { ApiEnv } from '../config/env.js'

export const CRITICAL_THREATIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type ThreatizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ThreatizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ThreatizabilityRolloutCheck[]
  guidance: string
}

export type ThreatizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingThreatizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateThreatizabilityRollout(
  input: ThreatizabilityRolloutInput,
): ThreatizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const threatizabilityTableCoverageComplete =
    input.existingThreatizabilityTableCount === CRITICAL_THREATIZABILITY_TABLES.length

  const checks: ThreatizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL threatizability checks can reach the database.'
            : 'Production threatizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'threatizability_signal_table_coverage',
      label: 'Threatizability signal table coverage',
      status: threatizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Threatizability signal table coverage is only enforced in production.'
          : threatizabilityTableCoverageComplete
            ? `${input.existingThreatizabilityTableCount}/${CRITICAL_THREATIZABILITY_TABLES.length} threatizability signal tables are present.`
            : `${input.existingThreatizabilityTableCount}/${CRITICAL_THREATIZABILITY_TABLES.length} threatizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_threatizability',
      label: 'Billing invoice threatizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice threatizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice threatizability signals.'
            : 'Production threatizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_threatizability',
      label: 'Billing record threatizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record threatizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record threatizability signals.'
            : 'Production threatizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          threatizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              threatizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production threatizability rollout requires PostgreSQL connectivity, threatizability tables, billing invoice threatizability, billing record threatizability, and full signal coverage.',
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
        ? 'Production threatizability rollout checks passed. Threatizability coverage and containerization readiness signal signals are healthy.'
        : 'Production threatizability rollout is not ready. Resolve failed checks before relying on production threatizability tooling.',
  }
}

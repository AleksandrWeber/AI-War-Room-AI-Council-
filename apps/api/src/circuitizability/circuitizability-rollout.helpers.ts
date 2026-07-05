import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CIRCUITIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type CircuitizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CircuitizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CircuitizabilityRolloutCheck[]
  guidance: string
}

export type CircuitizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCircuitizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateCircuitizabilityRollout(
  input: CircuitizabilityRolloutInput,
): CircuitizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const circuitizabilityTableCoverageComplete =
    input.existingCircuitizabilityTableCount === CRITICAL_CIRCUITIZABILITY_TABLES.length

  const checks: CircuitizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL circuitizability checks can reach the database.'
            : 'Production circuitizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'circuitizability_signal_table_coverage',
      label: 'Circuitizability signal table coverage',
      status: circuitizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Circuitizability signal table coverage is only enforced in production.'
          : circuitizabilityTableCoverageComplete
            ? `${input.existingCircuitizabilityTableCount}/${CRITICAL_CIRCUITIZABILITY_TABLES.length} circuitizability signal tables are present.`
            : `${input.existingCircuitizabilityTableCount}/${CRITICAL_CIRCUITIZABILITY_TABLES.length} circuitizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_circuitizability',
      label: 'Billing invoice circuitizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice circuitizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice circuitizability signals.'
            : 'Production circuitizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_circuitizability',
      label: 'Billing record circuitizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record circuitizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record circuitizability signals.'
            : 'Production circuitizability rollout requires a billing_records table.',
    },
    {
      name: 'circuitization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          circuitizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              circuitizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support circuitization readiness.'
            : 'Production circuitizability rollout requires PostgreSQL connectivity, circuitizability tables, billing invoice circuitizability, billing record circuitizability, and full signal coverage.',
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
        ? 'Production circuitizability rollout checks passed. Circuitizability coverage and containerization readiness signal signals are healthy.'
        : 'Production circuitizability rollout is not ready. Resolve failed checks before relying on production circuitizability tooling.',
  }
}

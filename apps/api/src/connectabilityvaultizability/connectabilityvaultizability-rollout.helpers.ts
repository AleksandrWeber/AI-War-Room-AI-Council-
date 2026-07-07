import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CONNECTABILITYVAULTIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type ConnectabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ConnectabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ConnectabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type ConnectabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingConnectabilityvaultizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateConnectabilityvaultizabilityRollout(
  input: ConnectabilityvaultizabilityRolloutInput,
): ConnectabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const connectabilityvaultizabilityTableCoverageComplete =
    input.existingConnectabilityvaultizabilityTableCount === CRITICAL_CONNECTABILITYVAULTIZABILITY_TABLES.length

  const checks: ConnectabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL connectabilityvaultizability checks can reach the database.'
            : 'Production connectabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'connectabilityvaultizability_signal_table_coverage',
      label: 'Connectabilityvaultizability signal table coverage',
      status: connectabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Connectabilityvaultizability signal table coverage is only enforced in production.'
          : connectabilityvaultizabilityTableCoverageComplete
            ? `${input.existingConnectabilityvaultizabilityTableCount}/${CRITICAL_CONNECTABILITYVAULTIZABILITY_TABLES.length} connectabilityvaultizability signal tables are present.`
            : `${input.existingConnectabilityvaultizabilityTableCount}/${CRITICAL_CONNECTABILITYVAULTIZABILITY_TABLES.length} connectabilityvaultizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_connectabilityvaultizability',
      label: 'Billing invoice connectabilityvaultizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice connectabilityvaultizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice connectabilityvaultizability signals.'
            : 'Production connectabilityvaultizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_connectabilityvaultizability',
      label: 'Billing record connectabilityvaultizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record connectabilityvaultizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record connectabilityvaultizability signals.'
            : 'Production connectabilityvaultizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          connectabilityvaultizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              connectabilityvaultizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production connectabilityvaultizability rollout requires PostgreSQL connectivity, connectabilityvaultizability tables, billing invoice connectabilityvaultizability, billing record connectabilityvaultizability, and full signal coverage.',
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
        ? 'Production connectabilityvaultizability rollout checks passed. Connectabilityvaultizability coverage and containerization readiness signal signals are healthy.'
        : 'Production connectabilityvaultizability rollout is not ready. Resolve failed checks before relying on production connectabilityvaultizability tooling.',
  }
}

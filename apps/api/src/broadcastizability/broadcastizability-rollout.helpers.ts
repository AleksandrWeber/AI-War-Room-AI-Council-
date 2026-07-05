import type { ApiEnv } from '../config/env.js'

export const CRITICAL_BROADCASTIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type BroadcastizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type BroadcastizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: BroadcastizabilityRolloutCheck[]
  guidance: string
}

export type BroadcastizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingBroadcastizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateBroadcastizabilityRollout(
  input: BroadcastizabilityRolloutInput,
): BroadcastizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const broadcastizabilityTableCoverageComplete =
    input.existingBroadcastizabilityTableCount === CRITICAL_BROADCASTIZABILITY_TABLES.length

  const checks: BroadcastizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL broadcastizability checks can reach the database.'
            : 'Production broadcastizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'broadcastizability_signal_table_coverage',
      label: 'Broadcastizability signal table coverage',
      status: broadcastizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Broadcastizability signal table coverage is only enforced in production.'
          : broadcastizabilityTableCoverageComplete
            ? `${input.existingBroadcastizabilityTableCount}/${CRITICAL_BROADCASTIZABILITY_TABLES.length} broadcastizability signal tables are present.`
            : `${input.existingBroadcastizabilityTableCount}/${CRITICAL_BROADCASTIZABILITY_TABLES.length} broadcastizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_broadcastizability',
      label: 'Billing invoice broadcastizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice broadcastizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice broadcastizability signals.'
            : 'Production broadcastizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_broadcastizability',
      label: 'Billing record broadcastizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record broadcastizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record broadcastizability signals.'
            : 'Production broadcastizability rollout requires a billing_records table.',
    },
    {
      name: 'broadcastization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          broadcastizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              broadcastizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support broadcastization readiness.'
            : 'Production broadcastizability rollout requires PostgreSQL connectivity, broadcastizability tables, billing invoice broadcastizability, billing record broadcastizability, and full signal coverage.',
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
        ? 'Production broadcastizability rollout checks passed. Broadcastizability coverage and containerization readiness signal signals are healthy.'
        : 'Production broadcastizability rollout is not ready. Resolve failed checks before relying on production broadcastizability tooling.',
  }
}

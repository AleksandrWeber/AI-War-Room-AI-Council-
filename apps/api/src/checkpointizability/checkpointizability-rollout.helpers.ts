import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CHECKPOINTIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type CheckpointizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CheckpointizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CheckpointizabilityRolloutCheck[]
  guidance: string
}

export type CheckpointizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCheckpointizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateCheckpointizabilityRollout(
  input: CheckpointizabilityRolloutInput,
): CheckpointizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const checkpointizabilityTableCoverageComplete =
    input.existingCheckpointizabilityTableCount === CRITICAL_CHECKPOINTIZABILITY_TABLES.length

  const checks: CheckpointizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL checkpointizability checks can reach the database.'
            : 'Production checkpointizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'checkpointizability_signal_table_coverage',
      label: 'Checkpointizability signal table coverage',
      status: checkpointizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Checkpointizability signal table coverage is only enforced in production.'
          : checkpointizabilityTableCoverageComplete
            ? `${input.existingCheckpointizabilityTableCount}/${CRITICAL_CHECKPOINTIZABILITY_TABLES.length} checkpointizability signal tables are present.`
            : `${input.existingCheckpointizabilityTableCount}/${CRITICAL_CHECKPOINTIZABILITY_TABLES.length} checkpointizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_checkpointizability',
      label: 'Billing invoice checkpointizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice checkpointizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice checkpointizability signals.'
            : 'Production checkpointizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_checkpointizability',
      label: 'Billing record checkpointizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record checkpointizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record checkpointizability signals.'
            : 'Production checkpointizability rollout requires a billing_records table.',
    },
    {
      name: 'checkpointization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          checkpointizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              checkpointizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support checkpointization readiness.'
            : 'Production checkpointizability rollout requires PostgreSQL connectivity, checkpointizability tables, billing invoice checkpointizability, billing record checkpointizability, and full signal coverage.',
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
        ? 'Production checkpointizability rollout checks passed. Checkpointizability coverage and containerization readiness signal signals are healthy.'
        : 'Production checkpointizability rollout is not ready. Resolve failed checks before relying on production checkpointizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TRANSFERABILITY_TABLES = [
  'billing_records',
  'billing_invoices',
  'billing_notifications',
] as const

export type TransferabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TransferabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TransferabilityRolloutCheck[]
  guidance: string
}

export type TransferabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTransferabilityTableCount: number
  billingRecordsTableExists: boolean
  billingInvoicesTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateTransferabilityRollout(
  input: TransferabilityRolloutInput,
): TransferabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const transferabilityTableCoverageComplete =
    input.existingTransferabilityTableCount === CRITICAL_TRANSFERABILITY_TABLES.length

  const checks: TransferabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL transferability checks can reach the database.'
            : 'Production transferability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'transferability_signal_table_coverage',
      label: 'Transferability signal table coverage',
      status: transferabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Transferability signal table coverage is only enforced in production.'
          : transferabilityTableCoverageComplete
            ? `${input.existingTransferabilityTableCount}/${CRITICAL_TRANSFERABILITY_TABLES.length} transferability signal tables are present.`
            : `${input.existingTransferabilityTableCount}/${CRITICAL_TRANSFERABILITY_TABLES.length} transferability signal tables were found.`,
    },
    {
      name: 'billing_record_transferability',
      label: 'Billing record transferability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record transferability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record transferability signals.'
            : 'Production transferability rollout requires a billing_records table.',
    },
    {
      name: 'billing_invoice_transferability',
      label: 'Billing invoice transferability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice transferability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice transferability signals.'
            : 'Production transferability rollout requires a billing_invoices table.',
    },
    {
      name: 'transfer_readiness_signal',
      label: 'Transfer readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          transferabilityTableCoverageComplete &&
          input.billingRecordsTableExists &&
          input.billingInvoicesTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Transfer readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              transferabilityTableCoverageComplete &&
              input.billingRecordsTableExists &&
              input.billingInvoicesTableExists &&
              input.billingNotificationsTableExists
            ? 'Billing records, billing invoices, and billing notifications support transfer readiness.'
            : 'Production transferability rollout requires PostgreSQL connectivity, transferability tables, billing record transferability, billing invoice transferability, and full signal coverage.',
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
        ? 'Production transferability rollout checks passed. Transferability coverage and transfer readiness signal signals are healthy.'
        : 'Production transferability rollout is not ready. Resolve failed checks before relying on production transferability tooling.',
  }
}

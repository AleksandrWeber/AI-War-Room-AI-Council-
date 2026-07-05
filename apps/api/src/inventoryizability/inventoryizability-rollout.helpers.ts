import type { ApiEnv } from '../config/env.js'

export const CRITICAL_INVENTORYIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type InventoryizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type InventoryizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: InventoryizabilityRolloutCheck[]
  guidance: string
}

export type InventoryizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingInventoryizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateInventoryizabilityRollout(
  input: InventoryizabilityRolloutInput,
): InventoryizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const inventoryizabilityTableCoverageComplete =
    input.existingInventoryizabilityTableCount === CRITICAL_INVENTORYIZABILITY_TABLES.length

  const checks: InventoryizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL inventoryizability checks can reach the database.'
            : 'Production inventoryizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'inventoryizability_signal_table_coverage',
      label: 'Inventoryizability signal table coverage',
      status: inventoryizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Inventoryizability signal table coverage is only enforced in production.'
          : inventoryizabilityTableCoverageComplete
            ? `${input.existingInventoryizabilityTableCount}/${CRITICAL_INVENTORYIZABILITY_TABLES.length} inventoryizability signal tables are present.`
            : `${input.existingInventoryizabilityTableCount}/${CRITICAL_INVENTORYIZABILITY_TABLES.length} inventoryizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_inventoryizability',
      label: 'Billing invoice inventoryizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice inventoryizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice inventoryizability signals.'
            : 'Production inventoryizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_inventoryizability',
      label: 'Billing record inventoryizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record inventoryizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record inventoryizability signals.'
            : 'Production inventoryizability rollout requires a billing_records table.',
    },
    {
      name: 'inventoryization_readiness_signal',
      label: 'Inventoryization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          inventoryizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Inventoryization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              inventoryizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support inventoryization readiness.'
            : 'Production inventoryizability rollout requires PostgreSQL connectivity, inventoryizability tables, billing invoice inventoryizability, billing record inventoryizability, and full signal coverage.',
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
        ? 'Production inventoryizability rollout checks passed. Inventoryizability coverage and inventoryization readiness signal signals are healthy.'
        : 'Production inventoryizability rollout is not ready. Resolve failed checks before relying on production inventoryizability tooling.',
  }
}

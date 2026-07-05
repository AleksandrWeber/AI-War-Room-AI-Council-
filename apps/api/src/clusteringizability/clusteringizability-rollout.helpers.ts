import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CLUSTERINGIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type ClusteringizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ClusteringizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ClusteringizabilityRolloutCheck[]
  guidance: string
}

export type ClusteringizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingClusteringizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateClusteringizabilityRollout(
  input: ClusteringizabilityRolloutInput,
): ClusteringizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const clusteringizabilityTableCoverageComplete =
    input.existingClusteringizabilityTableCount === CRITICAL_CLUSTERINGIZABILITY_TABLES.length

  const checks: ClusteringizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL clusteringizability checks can reach the database.'
            : 'Production clusteringizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'clusteringizability_signal_table_coverage',
      label: 'Clusteringizability signal table coverage',
      status: clusteringizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Clusteringizability signal table coverage is only enforced in production.'
          : clusteringizabilityTableCoverageComplete
            ? `${input.existingClusteringizabilityTableCount}/${CRITICAL_CLUSTERINGIZABILITY_TABLES.length} clusteringizability signal tables are present.`
            : `${input.existingClusteringizabilityTableCount}/${CRITICAL_CLUSTERINGIZABILITY_TABLES.length} clusteringizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_clusteringizability',
      label: 'Billing invoice clusteringizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice clusteringizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice clusteringizability signals.'
            : 'Production clusteringizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_clusteringizability',
      label: 'Billing record clusteringizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record clusteringizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record clusteringizability signals.'
            : 'Production clusteringizability rollout requires a billing_records table.',
    },
    {
      name: 'clusteringization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          clusteringizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              clusteringizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support clusteringization readiness.'
            : 'Production clusteringizability rollout requires PostgreSQL connectivity, clusteringizability tables, billing invoice clusteringizability, billing record clusteringizability, and full signal coverage.',
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
        ? 'Production clusteringizability rollout checks passed. Clusteringizability coverage and containerization readiness signal signals are healthy.'
        : 'Production clusteringizability rollout is not ready. Resolve failed checks before relying on production clusteringizability tooling.',
  }
}

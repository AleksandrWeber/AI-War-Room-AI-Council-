import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CONTAINERIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type ContainerizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ContainerizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ContainerizabilityRolloutCheck[]
  guidance: string
}

export type ContainerizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingContainerizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateContainerizabilityRollout(
  input: ContainerizabilityRolloutInput,
): ContainerizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const containerizabilityTableCoverageComplete =
    input.existingContainerizabilityTableCount === CRITICAL_CONTAINERIZABILITY_TABLES.length

  const checks: ContainerizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL containerizability checks can reach the database.'
            : 'Production containerizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'containerizability_signal_table_coverage',
      label: 'Containerizability signal table coverage',
      status: containerizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Containerizability signal table coverage is only enforced in production.'
          : containerizabilityTableCoverageComplete
            ? `${input.existingContainerizabilityTableCount}/${CRITICAL_CONTAINERIZABILITY_TABLES.length} containerizability signal tables are present.`
            : `${input.existingContainerizabilityTableCount}/${CRITICAL_CONTAINERIZABILITY_TABLES.length} containerizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_containerizability',
      label: 'Billing invoice containerizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice containerizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice containerizability signals.'
            : 'Production containerizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_containerizability',
      label: 'Billing record containerizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record containerizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record containerizability signals.'
            : 'Production containerizability rollout requires a billing_records table.',
    },
    {
      name: 'containerization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          containerizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              containerizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support containerization readiness.'
            : 'Production containerizability rollout requires PostgreSQL connectivity, containerizability tables, billing invoice containerizability, billing record containerizability, and full signal coverage.',
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
        ? 'Production containerizability rollout checks passed. Containerizability coverage and containerization readiness signal signals are healthy.'
        : 'Production containerizability rollout is not ready. Resolve failed checks before relying on production containerizability tooling.',
  }
}

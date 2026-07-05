import type { ApiEnv } from '../config/env.js'

export const CRITICAL_EXTENSIBILIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type ExtensibilizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ExtensibilizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ExtensibilizabilityRolloutCheck[]
  guidance: string
}

export type ExtensibilizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingExtensibilizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateExtensibilizabilityRollout(
  input: ExtensibilizabilityRolloutInput,
): ExtensibilizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const extensibilizabilityTableCoverageComplete =
    input.existingExtensibilizabilityTableCount === CRITICAL_EXTENSIBILIZABILITY_TABLES.length

  const checks: ExtensibilizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL extensibilizability checks can reach the database.'
            : 'Production extensibilizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'extensibilizability_signal_table_coverage',
      label: 'Extensibilizability signal table coverage',
      status: extensibilizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Extensibilizability signal table coverage is only enforced in production.'
          : extensibilizabilityTableCoverageComplete
            ? `${input.existingExtensibilizabilityTableCount}/${CRITICAL_EXTENSIBILIZABILITY_TABLES.length} extensibilizability signal tables are present.`
            : `${input.existingExtensibilizabilityTableCount}/${CRITICAL_EXTENSIBILIZABILITY_TABLES.length} extensibilizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_extensibilizability',
      label: 'Billing invoice extensibilizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice extensibilizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice extensibilizability signals.'
            : 'Production extensibilizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_extensibilizability',
      label: 'Billing record extensibilizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record extensibilizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record extensibilizability signals.'
            : 'Production extensibilizability rollout requires a billing_records table.',
    },
    {
      name: 'extensibilization_readiness_signal',
      label: 'Extensibilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          extensibilizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Extensibilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              extensibilizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support extensibilization readiness.'
            : 'Production extensibilizability rollout requires PostgreSQL connectivity, extensibilizability tables, billing invoice extensibilizability, billing record extensibilizability, and full signal coverage.',
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
        ? 'Production extensibilizability rollout checks passed. Extensibilizability coverage and extensibilization readiness signal signals are healthy.'
        : 'Production extensibilizability rollout is not ready. Resolve failed checks before relying on production extensibilizability tooling.',
  }
}

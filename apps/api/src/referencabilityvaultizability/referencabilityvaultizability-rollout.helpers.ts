import type { ApiEnv } from '../config/env.js'

export const CRITICAL_REFERENCABILITYVAULTIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type ReferencabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ReferencabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ReferencabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type ReferencabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingReferencabilityvaultizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateReferencabilityvaultizabilityRollout(
  input: ReferencabilityvaultizabilityRolloutInput,
): ReferencabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const referencabilityvaultizabilityTableCoverageComplete =
    input.existingReferencabilityvaultizabilityTableCount === CRITICAL_REFERENCABILITYVAULTIZABILITY_TABLES.length

  const checks: ReferencabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL referencabilityvaultizability checks can reach the database.'
            : 'Production referencabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'referencabilityvaultizability_signal_table_coverage',
      label: 'Referencabilityvaultizability signal table coverage',
      status: referencabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Referencabilityvaultizability signal table coverage is only enforced in production.'
          : referencabilityvaultizabilityTableCoverageComplete
            ? `${input.existingReferencabilityvaultizabilityTableCount}/${CRITICAL_REFERENCABILITYVAULTIZABILITY_TABLES.length} referencabilityvaultizability signal tables are present.`
            : `${input.existingReferencabilityvaultizabilityTableCount}/${CRITICAL_REFERENCABILITYVAULTIZABILITY_TABLES.length} referencabilityvaultizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_referencabilityvaultizability',
      label: 'Billing invoice referencabilityvaultizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice referencabilityvaultizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice referencabilityvaultizability signals.'
            : 'Production referencabilityvaultizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_referencabilityvaultizability',
      label: 'Billing record referencabilityvaultizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record referencabilityvaultizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record referencabilityvaultizability signals.'
            : 'Production referencabilityvaultizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          referencabilityvaultizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              referencabilityvaultizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production referencabilityvaultizability rollout requires PostgreSQL connectivity, referencabilityvaultizability tables, billing invoice referencabilityvaultizability, billing record referencabilityvaultizability, and full signal coverage.',
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
        ? 'Production referencabilityvaultizability rollout checks passed. Referencabilityvaultizability coverage and containerization readiness signal signals are healthy.'
        : 'Production referencabilityvaultizability rollout is not ready. Resolve failed checks before relying on production referencabilityvaultizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DEFENSIBILITYVAULTIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type DefensibilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DefensibilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DefensibilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type DefensibilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDefensibilityvaultizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateDefensibilityvaultizabilityRollout(
  input: DefensibilityvaultizabilityRolloutInput,
): DefensibilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const defensibilityvaultizabilityTableCoverageComplete =
    input.existingDefensibilityvaultizabilityTableCount === CRITICAL_DEFENSIBILITYVAULTIZABILITY_TABLES.length

  const checks: DefensibilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL defensibilityvaultizability checks can reach the database.'
            : 'Production defensibilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'defensibilityvaultizability_signal_table_coverage',
      label: 'Defensibilityvaultizability signal table coverage',
      status: defensibilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Defensibilityvaultizability signal table coverage is only enforced in production.'
          : defensibilityvaultizabilityTableCoverageComplete
            ? `${input.existingDefensibilityvaultizabilityTableCount}/${CRITICAL_DEFENSIBILITYVAULTIZABILITY_TABLES.length} defensibilityvaultizability signal tables are present.`
            : `${input.existingDefensibilityvaultizabilityTableCount}/${CRITICAL_DEFENSIBILITYVAULTIZABILITY_TABLES.length} defensibilityvaultizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_defensibilityvaultizability',
      label: 'Billing invoice defensibilityvaultizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice defensibilityvaultizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice defensibilityvaultizability signals.'
            : 'Production defensibilityvaultizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_defensibilityvaultizability',
      label: 'Billing record defensibilityvaultizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record defensibilityvaultizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record defensibilityvaultizability signals.'
            : 'Production defensibilityvaultizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          defensibilityvaultizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              defensibilityvaultizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production defensibilityvaultizability rollout requires PostgreSQL connectivity, defensibilityvaultizability tables, billing invoice defensibilityvaultizability, billing record defensibilityvaultizability, and full signal coverage.',
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
        ? 'Production defensibilityvaultizability rollout checks passed. Defensibilityvaultizability coverage and containerization readiness signal signals are healthy.'
        : 'Production defensibilityvaultizability rollout is not ready. Resolve failed checks before relying on production defensibilityvaultizability tooling.',
  }
}

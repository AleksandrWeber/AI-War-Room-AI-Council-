import type { ApiEnv } from '../config/env.js'

export const CRITICAL_VALIDITYVAULTIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type ValidityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ValidityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ValidityvaultizabilityRolloutCheck[]
  guidance: string
}

export type ValidityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingValidityvaultizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateValidityvaultizabilityRollout(
  input: ValidityvaultizabilityRolloutInput,
): ValidityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const validityvaultizabilityTableCoverageComplete =
    input.existingValidityvaultizabilityTableCount === CRITICAL_VALIDITYVAULTIZABILITY_TABLES.length

  const checks: ValidityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL validityvaultizability checks can reach the database.'
            : 'Production validityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'validityvaultizability_signal_table_coverage',
      label: 'Validityvaultizability signal table coverage',
      status: validityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Validityvaultizability signal table coverage is only enforced in production.'
          : validityvaultizabilityTableCoverageComplete
            ? `${input.existingValidityvaultizabilityTableCount}/${CRITICAL_VALIDITYVAULTIZABILITY_TABLES.length} validityvaultizability signal tables are present.`
            : `${input.existingValidityvaultizabilityTableCount}/${CRITICAL_VALIDITYVAULTIZABILITY_TABLES.length} validityvaultizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_validityvaultizability',
      label: 'Billing invoice validityvaultizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice validityvaultizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice validityvaultizability signals.'
            : 'Production validityvaultizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_validityvaultizability',
      label: 'Billing record validityvaultizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record validityvaultizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record validityvaultizability signals.'
            : 'Production validityvaultizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          validityvaultizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              validityvaultizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production validityvaultizability rollout requires PostgreSQL connectivity, validityvaultizability tables, billing invoice validityvaultizability, billing record validityvaultizability, and full signal coverage.',
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
        ? 'Production validityvaultizability rollout checks passed. Validityvaultizability coverage and containerization readiness signal signals are healthy.'
        : 'Production validityvaultizability rollout is not ready. Resolve failed checks before relying on production validityvaultizability tooling.',
  }
}

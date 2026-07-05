import type { ApiEnv } from '../config/env.js'

export const CRITICAL_STRATIFIABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type StratifiabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type StratifiabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: StratifiabilityRolloutCheck[]
  guidance: string
}

export type StratifiabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingStratifiabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateStratifiabilityRollout(
  input: StratifiabilityRolloutInput,
): StratifiabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const stratifiabilityTableCoverageComplete =
    input.existingStratifiabilityTableCount === CRITICAL_STRATIFIABILITY_TABLES.length

  const checks: StratifiabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL stratifiability checks can reach the database.'
            : 'Production stratifiability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'stratifiability_signal_table_coverage',
      label: 'Stratifiability signal table coverage',
      status: stratifiabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Stratifiability signal table coverage is only enforced in production.'
          : stratifiabilityTableCoverageComplete
            ? `${input.existingStratifiabilityTableCount}/${CRITICAL_STRATIFIABILITY_TABLES.length} stratifiability signal tables are present.`
            : `${input.existingStratifiabilityTableCount}/${CRITICAL_STRATIFIABILITY_TABLES.length} stratifiability signal tables were found.`,
    },
    {
      name: 'billing_invoice_stratifiability',
      label: 'Billing invoice stratifiability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice stratifiability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice stratifiability signals.'
            : 'Production stratifiability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_stratifiability',
      label: 'Billing record stratifiability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record stratifiability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record stratifiability signals.'
            : 'Production stratifiability rollout requires a billing_records table.',
    },
    {
      name: 'stratification_readiness_signal',
      label: 'Stratification readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          stratifiabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Stratification readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              stratifiabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support stratification readiness.'
            : 'Production stratifiability rollout requires PostgreSQL connectivity, stratifiability tables, billing invoice stratifiability, billing record stratifiability, and full signal coverage.',
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
        ? 'Production stratifiability rollout checks passed. Stratifiability coverage and stratification readiness signal signals are healthy.'
        : 'Production stratifiability rollout is not ready. Resolve failed checks before relying on production stratifiability tooling.',
  }
}

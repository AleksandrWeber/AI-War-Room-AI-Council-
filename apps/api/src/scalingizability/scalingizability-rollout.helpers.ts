import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SCALINGIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type ScalingizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ScalingizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ScalingizabilityRolloutCheck[]
  guidance: string
}

export type ScalingizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingScalingizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateScalingizabilityRollout(
  input: ScalingizabilityRolloutInput,
): ScalingizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const scalingizabilityTableCoverageComplete =
    input.existingScalingizabilityTableCount === CRITICAL_SCALINGIZABILITY_TABLES.length

  const checks: ScalingizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL scalingizability checks can reach the database.'
            : 'Production scalingizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'scalingizability_signal_table_coverage',
      label: 'Scalingizability signal table coverage',
      status: scalingizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Scalingizability signal table coverage is only enforced in production.'
          : scalingizabilityTableCoverageComplete
            ? `${input.existingScalingizabilityTableCount}/${CRITICAL_SCALINGIZABILITY_TABLES.length} scalingizability signal tables are present.`
            : `${input.existingScalingizabilityTableCount}/${CRITICAL_SCALINGIZABILITY_TABLES.length} scalingizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_scalingizability',
      label: 'Billing invoice scalingizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice scalingizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice scalingizability signals.'
            : 'Production scalingizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_scalingizability',
      label: 'Billing record scalingizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record scalingizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record scalingizability signals.'
            : 'Production scalingizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          scalingizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              scalingizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production scalingizability rollout requires PostgreSQL connectivity, scalingizability tables, billing invoice scalingizability, billing record scalingizability, and full signal coverage.',
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
        ? 'Production scalingizability rollout checks passed. Scalingizability coverage and containerization readiness signal signals are healthy.'
        : 'Production scalingizability rollout is not ready. Resolve failed checks before relying on production scalingizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_VERIFIABILITY_TABLES = [
  'billing_invoices',
  'billing_meter_usage_reports',
  'billing_webhook_events',
] as const

export type VerifiabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type VerifiabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: VerifiabilityRolloutCheck[]
  guidance: string
}

export type VerifiabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingVerifiabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingWebhookEventsTableExists: boolean
  billingMeterUsageReportsTableExists: boolean
}

export function evaluateVerifiabilityRollout(
  input: VerifiabilityRolloutInput,
): VerifiabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const verifiabilityTableCoverageComplete =
    input.existingVerifiabilityTableCount === CRITICAL_VERIFIABILITY_TABLES.length

  const checks: VerifiabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL verifiability checks can reach the database.'
            : 'Production verifiability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'verifiability_signal_table_coverage',
      label: 'Verifiability signal table coverage',
      status: verifiabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Verifiability signal table coverage is only enforced in production.'
          : verifiabilityTableCoverageComplete
            ? `${input.existingVerifiabilityTableCount}/${CRITICAL_VERIFIABILITY_TABLES.length} verifiability signal tables are present.`
            : `${input.existingVerifiabilityTableCount}/${CRITICAL_VERIFIABILITY_TABLES.length} verifiability signal tables were found.`,
    },
    {
      name: 'billing_invoice_verifiability',
      label: 'Billing invoice verifiability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice verifiability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice verifiability signals.'
            : 'Production verifiability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_webhook_verifiability',
      label: 'Billing webhook verifiability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook verifiability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook verifiability signals.'
            : 'Production verifiability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'evidence_readiness_signal',
      label: 'Evidence readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          verifiabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingWebhookEventsTableExists &&
          input.billingMeterUsageReportsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Evidence readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              verifiabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingWebhookEventsTableExists &&
              input.billingMeterUsageReportsTableExists
            ? 'Billing invoices, webhook events, and meter usage reports support evidence readiness.'
            : 'Production verifiability rollout requires PostgreSQL connectivity, verifiability tables, billing invoice verifiability, billing webhook verifiability, and full signal coverage.',
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
        ? 'Production verifiability rollout checks passed. Verifiability coverage and evidence readiness signal signals are healthy.'
        : 'Production verifiability rollout is not ready. Resolve failed checks before relying on production verifiability tooling.',
  }
}

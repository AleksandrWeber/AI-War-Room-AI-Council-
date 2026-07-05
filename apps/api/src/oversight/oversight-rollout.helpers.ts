import type { ApiEnv } from '../config/env.js'

export const CRITICAL_OVERSIGHT_TABLES = [
  'billing_invoices',
  'billing_webhook_events',
  'usage_events',
] as const

export type OversightRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type OversightRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: OversightRolloutCheck[]
  guidance: string
}

export type OversightRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingOversightTableCount: number
  billingInvoicesTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateOversightRollout(
  input: OversightRolloutInput,
): OversightRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const oversightTableCoverageComplete =
    input.existingOversightTableCount === CRITICAL_OVERSIGHT_TABLES.length

  const checks: OversightRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL oversight checks can reach the database.'
            : 'Production oversight rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'oversight_signal_table_coverage',
      label: 'Oversight signal table coverage',
      status: oversightTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Oversight signal table coverage is only enforced in production.'
          : oversightTableCoverageComplete
            ? `${input.existingOversightTableCount}/${CRITICAL_OVERSIGHT_TABLES.length} oversight signal tables are present.`
            : `${input.existingOversightTableCount}/${CRITICAL_OVERSIGHT_TABLES.length} oversight signal tables were found.`,
    },
    {
      name: 'billing_oversight',
      label: 'Billing oversight',
      status:
        input.billingInvoicesTableExists &&
        input.billingWebhookEventsTableExists
          ? 'pass'
          : !isProduction
            ? 'pass'
            : 'fail',
      detail:
        !isProduction
          ? 'Billing oversight is only enforced in production.'
          : input.billingInvoicesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'billing_invoices and billing_webhook_events tables are available for billing oversight signals.'
            : 'Production oversight rollout requires billing_invoices and billing_webhook_events tables.',
    },
    {
      name: 'usage_oversight',
      label: 'Usage oversight',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage oversight is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage oversight signals.'
            : 'Production oversight rollout requires a usage_events table.',
    },
    {
      name: 'control_readiness_signal',
      label: 'Control readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          oversightTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Control readiness is only enforced in production.'
          : input.postgresConnectivity &&
              oversightTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing invoices, webhook events, and usage telemetry support control readiness.'
            : 'Production oversight rollout requires PostgreSQL connectivity, oversight tables, billing oversight, and usage oversight coverage.',
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
        ? 'Production oversight rollout checks passed. Oversight coverage and control readiness signals are healthy.'
        : 'Production oversight rollout is not ready. Resolve failed checks before relying on production oversight tooling.',
  }
}

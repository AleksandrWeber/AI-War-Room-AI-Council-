import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CONTEXTUALIZABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type ContextualizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ContextualizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ContextualizabilityRolloutCheck[]
  guidance: string
}

export type ContextualizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingContextualizabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateContextualizabilityRollout(
  input: ContextualizabilityRolloutInput,
): ContextualizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const contextualizabilityTableCoverageComplete =
    input.existingContextualizabilityTableCount === CRITICAL_CONTEXTUALIZABILITY_TABLES.length

  const checks: ContextualizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL contextualizability checks can reach the database.'
            : 'Production contextualizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'contextualizability_signal_table_coverage',
      label: 'Contextualizability signal table coverage',
      status: contextualizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Contextualizability signal table coverage is only enforced in production.'
          : contextualizabilityTableCoverageComplete
            ? `${input.existingContextualizabilityTableCount}/${CRITICAL_CONTEXTUALIZABILITY_TABLES.length} contextualizability signal tables are present.`
            : `${input.existingContextualizabilityTableCount}/${CRITICAL_CONTEXTUALIZABILITY_TABLES.length} contextualizability signal tables were found.`,
    },
    {
      name: 'billing_webhook_contextualizability',
      label: 'Billing webhook contextualizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook contextualizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook contextualizability signals.'
            : 'Production contextualizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_contextualizability',
      label: 'Billing record contextualizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record contextualizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record contextualizability signals.'
            : 'Production contextualizability rollout requires a billing_records table.',
    },
    {
      name: 'contextualization_readiness_signal',
      label: 'Contextualization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          contextualizabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Contextualization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              contextualizabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support contextualization readiness.'
            : 'Production contextualizability rollout requires PostgreSQL connectivity, contextualizability tables, billing webhook contextualizability, billing record contextualizability, and full signal coverage.',
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
        ? 'Production contextualizability rollout checks passed. Contextualizability coverage and contextualization readiness signal signals are healthy.'
        : 'Production contextualizability rollout is not ready. Resolve failed checks before relying on production contextualizability tooling.',
  }
}

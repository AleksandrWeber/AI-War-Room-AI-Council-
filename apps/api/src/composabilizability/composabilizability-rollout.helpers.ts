import type { ApiEnv } from '../config/env.js'

export const CRITICAL_COMPOSABILIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type ComposabilizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ComposabilizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ComposabilizabilityRolloutCheck[]
  guidance: string
}

export type ComposabilizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingComposabilizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateComposabilizabilityRollout(
  input: ComposabilizabilityRolloutInput,
): ComposabilizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const composabilizabilityTableCoverageComplete =
    input.existingComposabilizabilityTableCount === CRITICAL_COMPOSABILIZABILITY_TABLES.length

  const checks: ComposabilizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL composabilizability checks can reach the database.'
            : 'Production composabilizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'composabilizability_signal_table_coverage',
      label: 'Composabilizability signal table coverage',
      status: composabilizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Composabilizability signal table coverage is only enforced in production.'
          : composabilizabilityTableCoverageComplete
            ? `${input.existingComposabilizabilityTableCount}/${CRITICAL_COMPOSABILIZABILITY_TABLES.length} composabilizability signal tables are present.`
            : `${input.existingComposabilizabilityTableCount}/${CRITICAL_COMPOSABILIZABILITY_TABLES.length} composabilizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_composabilizability',
      label: 'Idempotency key composabilizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key composabilizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key composabilizability signals.'
            : 'Production composabilizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_composabilizability',
      label: 'Usage event composabilizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event composabilizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event composabilizability signals.'
            : 'Production composabilizability rollout requires a usage_events table.',
    },
    {
      name: 'composabilization_readiness_signal',
      label: 'Composabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          composabilizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Composabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              composabilizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support composabilization readiness.'
            : 'Production composabilizability rollout requires PostgreSQL connectivity, composabilizability tables, idempotency key composabilizability, usage event composabilizability, and full signal coverage.',
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
        ? 'Production composabilizability rollout checks passed. Composabilizability coverage and composabilization readiness signal signals are healthy.'
        : 'Production composabilizability rollout is not ready. Resolve failed checks before relying on production composabilizability tooling.',
  }
}

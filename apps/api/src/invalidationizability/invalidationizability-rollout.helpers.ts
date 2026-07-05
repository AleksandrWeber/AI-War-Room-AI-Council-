import type { ApiEnv } from '../config/env.js'

export const CRITICAL_INVALIDATIONIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type InvalidationizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type InvalidationizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: InvalidationizabilityRolloutCheck[]
  guidance: string
}

export type InvalidationizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingInvalidationizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateInvalidationizabilityRollout(
  input: InvalidationizabilityRolloutInput,
): InvalidationizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const invalidationizabilityTableCoverageComplete =
    input.existingInvalidationizabilityTableCount === CRITICAL_INVALIDATIONIZABILITY_TABLES.length

  const checks: InvalidationizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL invalidationizability checks can reach the database.'
            : 'Production invalidationizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'invalidationizability_signal_table_coverage',
      label: 'Invalidationizability signal table coverage',
      status: invalidationizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Invalidationizability signal table coverage is only enforced in production.'
          : invalidationizabilityTableCoverageComplete
            ? `${input.existingInvalidationizabilityTableCount}/${CRITICAL_INVALIDATIONIZABILITY_TABLES.length} invalidationizability signal tables are present.`
            : `${input.existingInvalidationizabilityTableCount}/${CRITICAL_INVALIDATIONIZABILITY_TABLES.length} invalidationizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_invalidationizability',
      label: 'Idempotency key invalidationizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key invalidationizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key invalidationizability signals.'
            : 'Production invalidationizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_invalidationizability',
      label: 'Usage event invalidationizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event invalidationizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event invalidationizability signals.'
            : 'Production invalidationizability rollout requires a usage_events table.',
    },
    {
      name: 'invalidationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          invalidationizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              invalidationizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support invalidationization readiness.'
            : 'Production invalidationizability rollout requires PostgreSQL connectivity, invalidationizability tables, idempotency key invalidationizability, usage event invalidationizability, and full signal coverage.',
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
        ? 'Production invalidationizability rollout checks passed. Invalidationizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production invalidationizability rollout is not ready. Resolve failed checks before relying on production invalidationizability tooling.',
  }
}

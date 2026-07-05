import type { ApiEnv } from '../config/env.js'

export const CRITICAL_INDEXIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type IndexizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type IndexizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: IndexizabilityRolloutCheck[]
  guidance: string
}

export type IndexizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingIndexizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateIndexizabilityRollout(
  input: IndexizabilityRolloutInput,
): IndexizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const indexizabilityTableCoverageComplete =
    input.existingIndexizabilityTableCount === CRITICAL_INDEXIZABILITY_TABLES.length

  const checks: IndexizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL indexizability checks can reach the database.'
            : 'Production indexizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'indexizability_signal_table_coverage',
      label: 'Indexizability signal table coverage',
      status: indexizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Indexizability signal table coverage is only enforced in production.'
          : indexizabilityTableCoverageComplete
            ? `${input.existingIndexizabilityTableCount}/${CRITICAL_INDEXIZABILITY_TABLES.length} indexizability signal tables are present.`
            : `${input.existingIndexizabilityTableCount}/${CRITICAL_INDEXIZABILITY_TABLES.length} indexizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_indexizability',
      label: 'Idempotency key indexizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key indexizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key indexizability signals.'
            : 'Production indexizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_indexizability',
      label: 'Usage event indexizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event indexizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event indexizability signals.'
            : 'Production indexizability rollout requires a usage_events table.',
    },
    {
      name: 'indexization_readiness_signal',
      label: 'Indexization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          indexizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Indexization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              indexizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support indexization readiness.'
            : 'Production indexizability rollout requires PostgreSQL connectivity, indexizability tables, idempotency key indexizability, usage event indexizability, and full signal coverage.',
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
        ? 'Production indexizability rollout checks passed. Indexizability coverage and indexization readiness signal signals are healthy.'
        : 'Production indexizability rollout is not ready. Resolve failed checks before relying on production indexizability tooling.',
  }
}

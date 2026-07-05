import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PERSISTIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type PersistizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type PersistizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: PersistizabilityRolloutCheck[]
  guidance: string
}

export type PersistizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingPersistizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluatePersistizabilityRollout(
  input: PersistizabilityRolloutInput,
): PersistizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const persistizabilityTableCoverageComplete =
    input.existingPersistizabilityTableCount === CRITICAL_PERSISTIZABILITY_TABLES.length

  const checks: PersistizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL persistizability checks can reach the database.'
            : 'Production persistizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'persistizability_signal_table_coverage',
      label: 'Persistizability signal table coverage',
      status: persistizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Persistizability signal table coverage is only enforced in production.'
          : persistizabilityTableCoverageComplete
            ? `${input.existingPersistizabilityTableCount}/${CRITICAL_PERSISTIZABILITY_TABLES.length} persistizability signal tables are present.`
            : `${input.existingPersistizabilityTableCount}/${CRITICAL_PERSISTIZABILITY_TABLES.length} persistizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_persistizability',
      label: 'Idempotency key persistizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key persistizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key persistizability signals.'
            : 'Production persistizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_persistizability',
      label: 'Usage event persistizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event persistizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event persistizability signals.'
            : 'Production persistizability rollout requires a usage_events table.',
    },
    {
      name: 'persistization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          persistizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              persistizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support persistization readiness.'
            : 'Production persistizability rollout requires PostgreSQL connectivity, persistizability tables, idempotency key persistizability, usage event persistizability, and full signal coverage.',
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
        ? 'Production persistizability rollout checks passed. Persistizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production persistizability rollout is not ready. Resolve failed checks before relying on production persistizability tooling.',
  }
}

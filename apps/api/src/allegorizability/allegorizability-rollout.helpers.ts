import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ALLEGORIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type AllegorizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AllegorizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AllegorizabilityRolloutCheck[]
  guidance: string
}

export type AllegorizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAllegorizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateAllegorizabilityRollout(
  input: AllegorizabilityRolloutInput,
): AllegorizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const allegorizabilityTableCoverageComplete =
    input.existingAllegorizabilityTableCount === CRITICAL_ALLEGORIZABILITY_TABLES.length

  const checks: AllegorizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL allegorizability checks can reach the database.'
            : 'Production allegorizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'allegorizability_signal_table_coverage',
      label: 'Allegorizability signal table coverage',
      status: allegorizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Allegorizability signal table coverage is only enforced in production.'
          : allegorizabilityTableCoverageComplete
            ? `${input.existingAllegorizabilityTableCount}/${CRITICAL_ALLEGORIZABILITY_TABLES.length} allegorizability signal tables are present.`
            : `${input.existingAllegorizabilityTableCount}/${CRITICAL_ALLEGORIZABILITY_TABLES.length} allegorizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_allegorizability',
      label: 'Idempotency key allegorizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key allegorizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key allegorizability signals.'
            : 'Production allegorizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_allegorizability',
      label: 'Usage event allegorizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event allegorizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event allegorizability signals.'
            : 'Production allegorizability rollout requires a usage_events table.',
    },
    {
      name: 'allegorization_readiness_signal',
      label: 'Allegorization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          allegorizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Allegorization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              allegorizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support allegorization readiness.'
            : 'Production allegorizability rollout requires PostgreSQL connectivity, allegorizability tables, idempotency key allegorizability, usage event allegorizability, and full signal coverage.',
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
        ? 'Production allegorizability rollout checks passed. Allegorizability coverage and allegorization readiness signal signals are healthy.'
        : 'Production allegorizability rollout is not ready. Resolve failed checks before relying on production allegorizability tooling.',
  }
}

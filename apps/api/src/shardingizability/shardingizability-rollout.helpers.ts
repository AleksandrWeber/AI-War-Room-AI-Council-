import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SHARDINGIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type ShardingizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ShardingizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ShardingizabilityRolloutCheck[]
  guidance: string
}

export type ShardingizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingShardingizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateShardingizabilityRollout(
  input: ShardingizabilityRolloutInput,
): ShardingizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const shardingizabilityTableCoverageComplete =
    input.existingShardingizabilityTableCount === CRITICAL_SHARDINGIZABILITY_TABLES.length

  const checks: ShardingizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL shardingizability checks can reach the database.'
            : 'Production shardingizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'shardingizability_signal_table_coverage',
      label: 'Shardingizability signal table coverage',
      status: shardingizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shardingizability signal table coverage is only enforced in production.'
          : shardingizabilityTableCoverageComplete
            ? `${input.existingShardingizabilityTableCount}/${CRITICAL_SHARDINGIZABILITY_TABLES.length} shardingizability signal tables are present.`
            : `${input.existingShardingizabilityTableCount}/${CRITICAL_SHARDINGIZABILITY_TABLES.length} shardingizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_shardingizability',
      label: 'Idempotency key shardingizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key shardingizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key shardingizability signals.'
            : 'Production shardingizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_shardingizability',
      label: 'Usage event shardingizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event shardingizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event shardingizability signals.'
            : 'Production shardingizability rollout requires a usage_events table.',
    },
    {
      name: 'shardingization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          shardingizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              shardingizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support shardingization readiness.'
            : 'Production shardingizability rollout requires PostgreSQL connectivity, shardingizability tables, idempotency key shardingizability, usage event shardingizability, and full signal coverage.',
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
        ? 'Production shardingizability rollout checks passed. Shardingizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production shardingizability rollout is not ready. Resolve failed checks before relying on production shardingizability tooling.',
  }
}

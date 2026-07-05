import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ELASTICIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type ElasticizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ElasticizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ElasticizabilityRolloutCheck[]
  guidance: string
}

export type ElasticizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingElasticizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateElasticizabilityRollout(
  input: ElasticizabilityRolloutInput,
): ElasticizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const elasticizabilityTableCoverageComplete =
    input.existingElasticizabilityTableCount === CRITICAL_ELASTICIZABILITY_TABLES.length

  const checks: ElasticizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL elasticizability checks can reach the database.'
            : 'Production elasticizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'elasticizability_signal_table_coverage',
      label: 'Elasticizability signal table coverage',
      status: elasticizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Elasticizability signal table coverage is only enforced in production.'
          : elasticizabilityTableCoverageComplete
            ? `${input.existingElasticizabilityTableCount}/${CRITICAL_ELASTICIZABILITY_TABLES.length} elasticizability signal tables are present.`
            : `${input.existingElasticizabilityTableCount}/${CRITICAL_ELASTICIZABILITY_TABLES.length} elasticizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_elasticizability',
      label: 'Idempotency key elasticizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key elasticizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key elasticizability signals.'
            : 'Production elasticizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_elasticizability',
      label: 'Usage event elasticizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event elasticizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event elasticizability signals.'
            : 'Production elasticizability rollout requires a usage_events table.',
    },
    {
      name: 'elasticization_readiness_signal',
      label: 'Elasticization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          elasticizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Elasticization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              elasticizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support elasticization readiness.'
            : 'Production elasticizability rollout requires PostgreSQL connectivity, elasticizability tables, idempotency key elasticizability, usage event elasticizability, and full signal coverage.',
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
        ? 'Production elasticizability rollout checks passed. Elasticizability coverage and elasticization readiness signal signals are healthy.'
        : 'Production elasticizability rollout is not ready. Resolve failed checks before relying on production elasticizability tooling.',
  }
}

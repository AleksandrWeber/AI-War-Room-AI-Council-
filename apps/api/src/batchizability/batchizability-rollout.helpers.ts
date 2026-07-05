import type { ApiEnv } from '../config/env.js'

export const CRITICAL_BATCHIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type BatchizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type BatchizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: BatchizabilityRolloutCheck[]
  guidance: string
}

export type BatchizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingBatchizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateBatchizabilityRollout(
  input: BatchizabilityRolloutInput,
): BatchizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const batchizabilityTableCoverageComplete =
    input.existingBatchizabilityTableCount === CRITICAL_BATCHIZABILITY_TABLES.length

  const checks: BatchizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL batchizability checks can reach the database.'
            : 'Production batchizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'batchizability_signal_table_coverage',
      label: 'Batchizability signal table coverage',
      status: batchizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Batchizability signal table coverage is only enforced in production.'
          : batchizabilityTableCoverageComplete
            ? `${input.existingBatchizabilityTableCount}/${CRITICAL_BATCHIZABILITY_TABLES.length} batchizability signal tables are present.`
            : `${input.existingBatchizabilityTableCount}/${CRITICAL_BATCHIZABILITY_TABLES.length} batchizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_batchizability',
      label: 'Idempotency key batchizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key batchizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key batchizability signals.'
            : 'Production batchizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_batchizability',
      label: 'Usage event batchizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event batchizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event batchizability signals.'
            : 'Production batchizability rollout requires a usage_events table.',
    },
    {
      name: 'batchization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          batchizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              batchizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support batchization readiness.'
            : 'Production batchizability rollout requires PostgreSQL connectivity, batchizability tables, idempotency key batchizability, usage event batchizability, and full signal coverage.',
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
        ? 'Production batchizability rollout checks passed. Batchizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production batchizability rollout is not ready. Resolve failed checks before relying on production batchizability tooling.',
  }
}

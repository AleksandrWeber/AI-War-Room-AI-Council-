import type { ApiEnv } from '../config/env.js'

export const CRITICAL_QUEUEIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type QueueizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type QueueizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: QueueizabilityRolloutCheck[]
  guidance: string
}

export type QueueizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingQueueizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateQueueizabilityRollout(
  input: QueueizabilityRolloutInput,
): QueueizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const queueizabilityTableCoverageComplete =
    input.existingQueueizabilityTableCount === CRITICAL_QUEUEIZABILITY_TABLES.length

  const checks: QueueizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL queueizability checks can reach the database.'
            : 'Production queueizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'queueizability_signal_table_coverage',
      label: 'Queueizability signal table coverage',
      status: queueizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Queueizability signal table coverage is only enforced in production.'
          : queueizabilityTableCoverageComplete
            ? `${input.existingQueueizabilityTableCount}/${CRITICAL_QUEUEIZABILITY_TABLES.length} queueizability signal tables are present.`
            : `${input.existingQueueizabilityTableCount}/${CRITICAL_QUEUEIZABILITY_TABLES.length} queueizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_queueizability',
      label: 'Idempotency key queueizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key queueizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key queueizability signals.'
            : 'Production queueizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_queueizability',
      label: 'Usage event queueizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event queueizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event queueizability signals.'
            : 'Production queueizability rollout requires a usage_events table.',
    },
    {
      name: 'queueization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          queueizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              queueizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support queueization readiness.'
            : 'Production queueizability rollout requires PostgreSQL connectivity, queueizability tables, idempotency key queueizability, usage event queueizability, and full signal coverage.',
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
        ? 'Production queueizability rollout checks passed. Queueizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production queueizability rollout is not ready. Resolve failed checks before relying on production queueizability tooling.',
  }
}

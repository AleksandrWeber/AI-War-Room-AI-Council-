import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DISTINCTIVENESS_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type DistinctivenessRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DistinctivenessRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DistinctivenessRolloutCheck[]
  guidance: string
}

export type DistinctivenessRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDistinctivenessTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateDistinctivenessRollout(
  input: DistinctivenessRolloutInput,
): DistinctivenessRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const distinctivenessTableCoverageComplete =
    input.existingDistinctivenessTableCount === CRITICAL_DISTINCTIVENESS_TABLES.length

  const checks: DistinctivenessRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL distinctiveness checks can reach the database.'
            : 'Production distinctiveness rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'distinctiveness_signal_table_coverage',
      label: 'Distinctiveness signal table coverage',
      status: distinctivenessTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Distinctiveness signal table coverage is only enforced in production.'
          : distinctivenessTableCoverageComplete
            ? `${input.existingDistinctivenessTableCount}/${CRITICAL_DISTINCTIVENESS_TABLES.length} distinctiveness signal tables are present.`
            : `${input.existingDistinctivenessTableCount}/${CRITICAL_DISTINCTIVENESS_TABLES.length} distinctiveness signal tables were found.`,
    },
    {
      name: 'idempotency_key_distinctiveness',
      label: 'Idempotency key distinctiveness',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key distinctiveness is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key distinctiveness signals.'
            : 'Production distinctiveness rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_distinctiveness',
      label: 'Usage event distinctiveness',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event distinctiveness is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event distinctiveness signals.'
            : 'Production distinctiveness rollout requires a usage_events table.',
    },
    {
      name: 'distinction_readiness_signal',
      label: 'Distinction readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          distinctivenessTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Distinction readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              distinctivenessTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support distinction readiness.'
            : 'Production distinctiveness rollout requires PostgreSQL connectivity, distinctiveness tables, idempotency key distinctiveness, usage event distinctiveness, and full signal coverage.',
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
        ? 'Production distinctiveness rollout checks passed. Distinctiveness coverage and distinction readiness signal signals are healthy.'
        : 'Production distinctiveness rollout is not ready. Resolve failed checks before relying on production distinctiveness tooling.',
  }
}

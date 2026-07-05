import type { ApiEnv } from '../config/env.js'

export const CRITICAL_OPERABILIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type OperabilizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type OperabilizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: OperabilizabilityRolloutCheck[]
  guidance: string
}

export type OperabilizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingOperabilizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateOperabilizabilityRollout(
  input: OperabilizabilityRolloutInput,
): OperabilizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const operabilizabilityTableCoverageComplete =
    input.existingOperabilizabilityTableCount === CRITICAL_OPERABILIZABILITY_TABLES.length

  const checks: OperabilizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL operabilizability checks can reach the database.'
            : 'Production operabilizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'operabilizability_signal_table_coverage',
      label: 'Operabilizability signal table coverage',
      status: operabilizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Operabilizability signal table coverage is only enforced in production.'
          : operabilizabilityTableCoverageComplete
            ? `${input.existingOperabilizabilityTableCount}/${CRITICAL_OPERABILIZABILITY_TABLES.length} operabilizability signal tables are present.`
            : `${input.existingOperabilizabilityTableCount}/${CRITICAL_OPERABILIZABILITY_TABLES.length} operabilizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_operabilizability',
      label: 'Idempotency key operabilizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key operabilizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key operabilizability signals.'
            : 'Production operabilizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_operabilizability',
      label: 'Usage event operabilizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event operabilizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event operabilizability signals.'
            : 'Production operabilizability rollout requires a usage_events table.',
    },
    {
      name: 'operabilization_readiness_signal',
      label: 'Operabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          operabilizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Operabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              operabilizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support operabilization readiness.'
            : 'Production operabilizability rollout requires PostgreSQL connectivity, operabilizability tables, idempotency key operabilizability, usage event operabilizability, and full signal coverage.',
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
        ? 'Production operabilizability rollout checks passed. Operabilizability coverage and operabilization readiness signal signals are healthy.'
        : 'Production operabilizability rollout is not ready. Resolve failed checks before relying on production operabilizability tooling.',
  }
}

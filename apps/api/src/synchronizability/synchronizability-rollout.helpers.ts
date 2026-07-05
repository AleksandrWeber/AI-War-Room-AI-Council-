import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SYNCHRONIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type SynchronizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SynchronizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SynchronizabilityRolloutCheck[]
  guidance: string
}

export type SynchronizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSynchronizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateSynchronizabilityRollout(
  input: SynchronizabilityRolloutInput,
): SynchronizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const synchronizabilityTableCoverageComplete =
    input.existingSynchronizabilityTableCount === CRITICAL_SYNCHRONIZABILITY_TABLES.length

  const checks: SynchronizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL synchronizability checks can reach the database.'
            : 'Production synchronizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'synchronizability_signal_table_coverage',
      label: 'Synchronizability signal table coverage',
      status: synchronizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Synchronizability signal table coverage is only enforced in production.'
          : synchronizabilityTableCoverageComplete
            ? `${input.existingSynchronizabilityTableCount}/${CRITICAL_SYNCHRONIZABILITY_TABLES.length} synchronizability signal tables are present.`
            : `${input.existingSynchronizabilityTableCount}/${CRITICAL_SYNCHRONIZABILITY_TABLES.length} synchronizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_synchronizability',
      label: 'Idempotency key synchronizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key synchronizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key synchronizability signals.'
            : 'Production synchronizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_synchronizability',
      label: 'Usage event synchronizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event synchronizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event synchronizability signals.'
            : 'Production synchronizability rollout requires a usage_events table.',
    },
    {
      name: 'synchronization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          synchronizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              synchronizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support synchronization readiness.'
            : 'Production synchronizability rollout requires PostgreSQL connectivity, synchronizability tables, idempotency key synchronizability, usage event synchronizability, and full signal coverage.',
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
        ? 'Production synchronizability rollout checks passed. Synchronizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production synchronizability rollout is not ready. Resolve failed checks before relying on production synchronizability tooling.',
  }
}

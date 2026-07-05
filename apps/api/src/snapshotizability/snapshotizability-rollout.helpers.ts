import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SNAPSHOTIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type SnapshotizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SnapshotizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SnapshotizabilityRolloutCheck[]
  guidance: string
}

export type SnapshotizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSnapshotizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateSnapshotizabilityRollout(
  input: SnapshotizabilityRolloutInput,
): SnapshotizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const snapshotizabilityTableCoverageComplete =
    input.existingSnapshotizabilityTableCount === CRITICAL_SNAPSHOTIZABILITY_TABLES.length

  const checks: SnapshotizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL snapshotizability checks can reach the database.'
            : 'Production snapshotizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'snapshotizability_signal_table_coverage',
      label: 'Snapshotizability signal table coverage',
      status: snapshotizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Snapshotizability signal table coverage is only enforced in production.'
          : snapshotizabilityTableCoverageComplete
            ? `${input.existingSnapshotizabilityTableCount}/${CRITICAL_SNAPSHOTIZABILITY_TABLES.length} snapshotizability signal tables are present.`
            : `${input.existingSnapshotizabilityTableCount}/${CRITICAL_SNAPSHOTIZABILITY_TABLES.length} snapshotizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_snapshotizability',
      label: 'Idempotency key snapshotizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key snapshotizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key snapshotizability signals.'
            : 'Production snapshotizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_snapshotizability',
      label: 'Usage event snapshotizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event snapshotizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event snapshotizability signals.'
            : 'Production snapshotizability rollout requires a usage_events table.',
    },
    {
      name: 'snapshotization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          snapshotizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              snapshotizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support snapshotization readiness.'
            : 'Production snapshotizability rollout requires PostgreSQL connectivity, snapshotizability tables, idempotency key snapshotizability, usage event snapshotizability, and full signal coverage.',
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
        ? 'Production snapshotizability rollout checks passed. Snapshotizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production snapshotizability rollout is not ready. Resolve failed checks before relying on production snapshotizability tooling.',
  }
}

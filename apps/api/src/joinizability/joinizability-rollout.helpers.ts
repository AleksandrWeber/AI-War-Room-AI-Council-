import type { ApiEnv } from '../config/env.js'

export const CRITICAL_JOINIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type JoinizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type JoinizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: JoinizabilityRolloutCheck[]
  guidance: string
}

export type JoinizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingJoinizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateJoinizabilityRollout(
  input: JoinizabilityRolloutInput,
): JoinizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const joinizabilityTableCoverageComplete =
    input.existingJoinizabilityTableCount === CRITICAL_JOINIZABILITY_TABLES.length

  const checks: JoinizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL joinizability checks can reach the database.'
            : 'Production joinizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'joinizability_signal_table_coverage',
      label: 'Joinizability signal table coverage',
      status: joinizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Joinizability signal table coverage is only enforced in production.'
          : joinizabilityTableCoverageComplete
            ? `${input.existingJoinizabilityTableCount}/${CRITICAL_JOINIZABILITY_TABLES.length} joinizability signal tables are present.`
            : `${input.existingJoinizabilityTableCount}/${CRITICAL_JOINIZABILITY_TABLES.length} joinizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_joinizability',
      label: 'Idempotency key joinizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key joinizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key joinizability signals.'
            : 'Production joinizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_joinizability',
      label: 'Usage event joinizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event joinizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event joinizability signals.'
            : 'Production joinizability rollout requires a usage_events table.',
    },
    {
      name: 'joinization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          joinizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              joinizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support joinization readiness.'
            : 'Production joinizability rollout requires PostgreSQL connectivity, joinizability tables, idempotency key joinizability, usage event joinizability, and full signal coverage.',
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
        ? 'Production joinizability rollout checks passed. Joinizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production joinizability rollout is not ready. Resolve failed checks before relying on production joinizability tooling.',
  }
}

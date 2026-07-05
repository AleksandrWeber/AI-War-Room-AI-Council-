import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ABDUCTIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type AbductizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AbductizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AbductizabilityRolloutCheck[]
  guidance: string
}

export type AbductizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAbductizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateAbductizabilityRollout(
  input: AbductizabilityRolloutInput,
): AbductizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const abductizabilityTableCoverageComplete =
    input.existingAbductizabilityTableCount === CRITICAL_ABDUCTIZABILITY_TABLES.length

  const checks: AbductizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL abductizability checks can reach the database.'
            : 'Production abductizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'abductizability_signal_table_coverage',
      label: 'Abductizability signal table coverage',
      status: abductizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Abductizability signal table coverage is only enforced in production.'
          : abductizabilityTableCoverageComplete
            ? `${input.existingAbductizabilityTableCount}/${CRITICAL_ABDUCTIZABILITY_TABLES.length} abductizability signal tables are present.`
            : `${input.existingAbductizabilityTableCount}/${CRITICAL_ABDUCTIZABILITY_TABLES.length} abductizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_abductizability',
      label: 'Idempotency key abductizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key abductizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key abductizability signals.'
            : 'Production abductizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_abductizability',
      label: 'Usage event abductizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event abductizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event abductizability signals.'
            : 'Production abductizability rollout requires a usage_events table.',
    },
    {
      name: 'abductization_readiness_signal',
      label: 'Abductization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          abductizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Abductization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              abductizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support abductization readiness.'
            : 'Production abductizability rollout requires PostgreSQL connectivity, abductizability tables, idempotency key abductizability, usage event abductizability, and full signal coverage.',
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
        ? 'Production abductizability rollout checks passed. Abductizability coverage and abductization readiness signal signals are healthy.'
        : 'Production abductizability rollout is not ready. Resolve failed checks before relying on production abductizability tooling.',
  }
}

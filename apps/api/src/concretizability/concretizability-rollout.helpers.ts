import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CONCRETIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type ConcretizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ConcretizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ConcretizabilityRolloutCheck[]
  guidance: string
}

export type ConcretizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingConcretizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateConcretizabilityRollout(
  input: ConcretizabilityRolloutInput,
): ConcretizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const concretizabilityTableCoverageComplete =
    input.existingConcretizabilityTableCount === CRITICAL_CONCRETIZABILITY_TABLES.length

  const checks: ConcretizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL concretizability checks can reach the database.'
            : 'Production concretizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'concretizability_signal_table_coverage',
      label: 'Concretizability signal table coverage',
      status: concretizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Concretizability signal table coverage is only enforced in production.'
          : concretizabilityTableCoverageComplete
            ? `${input.existingConcretizabilityTableCount}/${CRITICAL_CONCRETIZABILITY_TABLES.length} concretizability signal tables are present.`
            : `${input.existingConcretizabilityTableCount}/${CRITICAL_CONCRETIZABILITY_TABLES.length} concretizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_concretizability',
      label: 'Idempotency key concretizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key concretizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key concretizability signals.'
            : 'Production concretizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_concretizability',
      label: 'Usage event concretizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event concretizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event concretizability signals.'
            : 'Production concretizability rollout requires a usage_events table.',
    },
    {
      name: 'concretization_readiness_signal',
      label: 'Concretization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          concretizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Concretization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              concretizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support concretization readiness.'
            : 'Production concretizability rollout requires PostgreSQL connectivity, concretizability tables, idempotency key concretizability, usage event concretizability, and full signal coverage.',
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
        ? 'Production concretizability rollout checks passed. Concretizability coverage and concretization readiness signal signals are healthy.'
        : 'Production concretizability rollout is not ready. Resolve failed checks before relying on production concretizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_REFERENCIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type ReferencizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ReferencizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ReferencizabilityRolloutCheck[]
  guidance: string
}

export type ReferencizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingReferencizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateReferencizabilityRollout(
  input: ReferencizabilityRolloutInput,
): ReferencizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const referencizabilityTableCoverageComplete =
    input.existingReferencizabilityTableCount === CRITICAL_REFERENCIZABILITY_TABLES.length

  const checks: ReferencizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL referencizability checks can reach the database.'
            : 'Production referencizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'referencizability_signal_table_coverage',
      label: 'Referencizability signal table coverage',
      status: referencizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Referencizability signal table coverage is only enforced in production.'
          : referencizabilityTableCoverageComplete
            ? `${input.existingReferencizabilityTableCount}/${CRITICAL_REFERENCIZABILITY_TABLES.length} referencizability signal tables are present.`
            : `${input.existingReferencizabilityTableCount}/${CRITICAL_REFERENCIZABILITY_TABLES.length} referencizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_referencizability',
      label: 'Idempotency key referencizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key referencizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key referencizability signals.'
            : 'Production referencizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_referencizability',
      label: 'Usage event referencizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event referencizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event referencizability signals.'
            : 'Production referencizability rollout requires a usage_events table.',
    },
    {
      name: 'referencization_readiness_signal',
      label: 'Referencization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          referencizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Referencization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              referencizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support referencization readiness.'
            : 'Production referencizability rollout requires PostgreSQL connectivity, referencizability tables, idempotency key referencizability, usage event referencizability, and full signal coverage.',
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
        ? 'Production referencizability rollout checks passed. Referencizability coverage and referencization readiness signal signals are healthy.'
        : 'Production referencizability rollout is not ready. Resolve failed checks before relying on production referencizability tooling.',
  }
}

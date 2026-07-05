import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CLASSIFIABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type ClassifiabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ClassifiabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ClassifiabilityRolloutCheck[]
  guidance: string
}

export type ClassifiabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingClassifiabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateClassifiabilityRollout(
  input: ClassifiabilityRolloutInput,
): ClassifiabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const classifiabilityTableCoverageComplete =
    input.existingClassifiabilityTableCount === CRITICAL_CLASSIFIABILITY_TABLES.length

  const checks: ClassifiabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL classifiability checks can reach the database.'
            : 'Production classifiability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'classifiability_signal_table_coverage',
      label: 'Classifiability signal table coverage',
      status: classifiabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Classifiability signal table coverage is only enforced in production.'
          : classifiabilityTableCoverageComplete
            ? `${input.existingClassifiabilityTableCount}/${CRITICAL_CLASSIFIABILITY_TABLES.length} classifiability signal tables are present.`
            : `${input.existingClassifiabilityTableCount}/${CRITICAL_CLASSIFIABILITY_TABLES.length} classifiability signal tables were found.`,
    },
    {
      name: 'idempotency_key_classifiability',
      label: 'Idempotency key classifiability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key classifiability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key classifiability signals.'
            : 'Production classifiability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_classifiability',
      label: 'Usage event classifiability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event classifiability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event classifiability signals.'
            : 'Production classifiability rollout requires a usage_events table.',
    },
    {
      name: 'classification_readiness_signal',
      label: 'Classification readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          classifiabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Classification readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              classifiabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support classification readiness.'
            : 'Production classifiability rollout requires PostgreSQL connectivity, classifiability tables, idempotency key classifiability, usage event classifiability, and full signal coverage.',
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
        ? 'Production classifiability rollout checks passed. Classifiability coverage and classification readiness signal signals are healthy.'
        : 'Production classifiability rollout is not ready. Resolve failed checks before relying on production classifiability tooling.',
  }
}

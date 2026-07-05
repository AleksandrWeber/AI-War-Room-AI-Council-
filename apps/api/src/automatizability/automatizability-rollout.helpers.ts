import type { ApiEnv } from '../config/env.js'

export const CRITICAL_AUTOMATIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type AutomatizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AutomatizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AutomatizabilityRolloutCheck[]
  guidance: string
}

export type AutomatizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAutomatizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateAutomatizabilityRollout(
  input: AutomatizabilityRolloutInput,
): AutomatizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const automatizabilityTableCoverageComplete =
    input.existingAutomatizabilityTableCount === CRITICAL_AUTOMATIZABILITY_TABLES.length

  const checks: AutomatizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL automatizability checks can reach the database.'
            : 'Production automatizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'automatizability_signal_table_coverage',
      label: 'Automatizability signal table coverage',
      status: automatizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Automatizability signal table coverage is only enforced in production.'
          : automatizabilityTableCoverageComplete
            ? `${input.existingAutomatizabilityTableCount}/${CRITICAL_AUTOMATIZABILITY_TABLES.length} automatizability signal tables are present.`
            : `${input.existingAutomatizabilityTableCount}/${CRITICAL_AUTOMATIZABILITY_TABLES.length} automatizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_automatizability',
      label: 'Idempotency key automatizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key automatizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key automatizability signals.'
            : 'Production automatizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_automatizability',
      label: 'Usage event automatizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event automatizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event automatizability signals.'
            : 'Production automatizability rollout requires a usage_events table.',
    },
    {
      name: 'automatization_readiness_signal',
      label: 'Automatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          automatizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Automatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              automatizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support automatization readiness.'
            : 'Production automatizability rollout requires PostgreSQL connectivity, automatizability tables, idempotency key automatizability, usage event automatizability, and full signal coverage.',
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
        ? 'Production automatizability rollout checks passed. Automatizability coverage and automatization readiness signal signals are healthy.'
        : 'Production automatizability rollout is not ready. Resolve failed checks before relying on production automatizability tooling.',
  }
}

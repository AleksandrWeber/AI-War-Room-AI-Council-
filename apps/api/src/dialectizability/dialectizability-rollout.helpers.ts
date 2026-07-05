import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DIALECTIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type DialectizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DialectizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DialectizabilityRolloutCheck[]
  guidance: string
}

export type DialectizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDialectizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateDialectizabilityRollout(
  input: DialectizabilityRolloutInput,
): DialectizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const dialectizabilityTableCoverageComplete =
    input.existingDialectizabilityTableCount === CRITICAL_DIALECTIZABILITY_TABLES.length

  const checks: DialectizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL dialectizability checks can reach the database.'
            : 'Production dialectizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'dialectizability_signal_table_coverage',
      label: 'Dialectizability signal table coverage',
      status: dialectizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Dialectizability signal table coverage is only enforced in production.'
          : dialectizabilityTableCoverageComplete
            ? `${input.existingDialectizabilityTableCount}/${CRITICAL_DIALECTIZABILITY_TABLES.length} dialectizability signal tables are present.`
            : `${input.existingDialectizabilityTableCount}/${CRITICAL_DIALECTIZABILITY_TABLES.length} dialectizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_dialectizability',
      label: 'Idempotency key dialectizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key dialectizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key dialectizability signals.'
            : 'Production dialectizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_dialectizability',
      label: 'Usage event dialectizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event dialectizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event dialectizability signals.'
            : 'Production dialectizability rollout requires a usage_events table.',
    },
    {
      name: 'dialectization_readiness_signal',
      label: 'Dialectization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          dialectizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Dialectization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              dialectizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support dialectization readiness.'
            : 'Production dialectizability rollout requires PostgreSQL connectivity, dialectizability tables, idempotency key dialectizability, usage event dialectizability, and full signal coverage.',
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
        ? 'Production dialectizability rollout checks passed. Dialectizability coverage and dialectization readiness signal signals are healthy.'
        : 'Production dialectizability rollout is not ready. Resolve failed checks before relying on production dialectizability tooling.',
  }
}

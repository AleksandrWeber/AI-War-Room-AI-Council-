import type { ApiEnv } from '../config/env.js'

export const CRITICAL_FORMULATABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type FormulatabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type FormulatabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: FormulatabilityRolloutCheck[]
  guidance: string
}

export type FormulatabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingFormulatabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateFormulatabilityRollout(
  input: FormulatabilityRolloutInput,
): FormulatabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const formulatabilityTableCoverageComplete =
    input.existingFormulatabilityTableCount === CRITICAL_FORMULATABILITY_TABLES.length

  const checks: FormulatabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL formulatability checks can reach the database.'
            : 'Production formulatability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'formulatability_signal_table_coverage',
      label: 'Formulatability signal table coverage',
      status: formulatabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Formulatability signal table coverage is only enforced in production.'
          : formulatabilityTableCoverageComplete
            ? `${input.existingFormulatabilityTableCount}/${CRITICAL_FORMULATABILITY_TABLES.length} formulatability signal tables are present.`
            : `${input.existingFormulatabilityTableCount}/${CRITICAL_FORMULATABILITY_TABLES.length} formulatability signal tables were found.`,
    },
    {
      name: 'idempotency_key_formulatability',
      label: 'Idempotency key formulatability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key formulatability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key formulatability signals.'
            : 'Production formulatability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_formulatability',
      label: 'Usage event formulatability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event formulatability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event formulatability signals.'
            : 'Production formulatability rollout requires a usage_events table.',
    },
    {
      name: 'formulation_readiness_signal',
      label: 'Formulation readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          formulatabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Formulation readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              formulatabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support formulation readiness.'
            : 'Production formulatability rollout requires PostgreSQL connectivity, formulatability tables, idempotency key formulatability, usage event formulatability, and full signal coverage.',
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
        ? 'Production formulatability rollout checks passed. Formulatability coverage and formulation readiness signal signals are healthy.'
        : 'Production formulatability rollout is not ready. Resolve failed checks before relying on production formulatability tooling.',
  }
}

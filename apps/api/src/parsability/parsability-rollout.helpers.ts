import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PARSABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type ParsabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ParsabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ParsabilityRolloutCheck[]
  guidance: string
}

export type ParsabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingParsabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateParsabilityRollout(
  input: ParsabilityRolloutInput,
): ParsabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const parsabilityTableCoverageComplete =
    input.existingParsabilityTableCount === CRITICAL_PARSABILITY_TABLES.length

  const checks: ParsabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL parsability checks can reach the database.'
            : 'Production parsability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'parsability_signal_table_coverage',
      label: 'Parsability signal table coverage',
      status: parsabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Parsability signal table coverage is only enforced in production.'
          : parsabilityTableCoverageComplete
            ? `${input.existingParsabilityTableCount}/${CRITICAL_PARSABILITY_TABLES.length} parsability signal tables are present.`
            : `${input.existingParsabilityTableCount}/${CRITICAL_PARSABILITY_TABLES.length} parsability signal tables were found.`,
    },
    {
      name: 'idempotency_key_parsability',
      label: 'Idempotency key parsability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key parsability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key parsability signals.'
            : 'Production parsability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_parsability',
      label: 'Usage event parsability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event parsability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event parsability signals.'
            : 'Production parsability rollout requires a usage_events table.',
    },
    {
      name: 'parsing_readiness_signal',
      label: 'Parsing readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          parsabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Parsing readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              parsabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support parsing readiness.'
            : 'Production parsability rollout requires PostgreSQL connectivity, parsability tables, idempotency key parsability, usage event parsability, and full signal coverage.',
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
        ? 'Production parsability rollout checks passed. Parsability coverage and parsing readiness signal signals are healthy.'
        : 'Production parsability rollout is not ready. Resolve failed checks before relying on production parsability tooling.',
  }
}

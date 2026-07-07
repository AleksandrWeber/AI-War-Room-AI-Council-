import type { ApiEnv } from '../config/env.js'

export const CRITICAL_WITNESSJOURNALIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type WitnessjournalizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type WitnessjournalizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: WitnessjournalizabilityRolloutCheck[]
  guidance: string
}

export type WitnessjournalizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingWitnessjournalizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateWitnessjournalizabilityRollout(
  input: WitnessjournalizabilityRolloutInput,
): WitnessjournalizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const witnessjournalizabilityTableCoverageComplete =
    input.existingWitnessjournalizabilityTableCount === CRITICAL_WITNESSJOURNALIZABILITY_TABLES.length

  const checks: WitnessjournalizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL witnessjournalizability checks can reach the database.'
            : 'Production witnessjournalizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'witnessjournalizability_signal_table_coverage',
      label: 'Witnessjournalizability signal table coverage',
      status: witnessjournalizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Witnessjournalizability signal table coverage is only enforced in production.'
          : witnessjournalizabilityTableCoverageComplete
            ? `${input.existingWitnessjournalizabilityTableCount}/${CRITICAL_WITNESSJOURNALIZABILITY_TABLES.length} witnessjournalizability signal tables are present.`
            : `${input.existingWitnessjournalizabilityTableCount}/${CRITICAL_WITNESSJOURNALIZABILITY_TABLES.length} witnessjournalizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_witnessjournalizability',
      label: 'Idempotency key witnessjournalizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key witnessjournalizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key witnessjournalizability signals.'
            : 'Production witnessjournalizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_witnessjournalizability',
      label: 'Usage event witnessjournalizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event witnessjournalizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event witnessjournalizability signals.'
            : 'Production witnessjournalizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          witnessjournalizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              witnessjournalizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production witnessjournalizability rollout requires PostgreSQL connectivity, witnessjournalizability tables, idempotency key witnessjournalizability, usage event witnessjournalizability, and full signal coverage.',
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
        ? 'Production witnessjournalizability rollout checks passed. Witnessjournalizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production witnessjournalizability rollout is not ready. Resolve failed checks before relying on production witnessjournalizability tooling.',
  }
}

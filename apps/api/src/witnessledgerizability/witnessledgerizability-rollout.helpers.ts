import type { ApiEnv } from '../config/env.js'

export const CRITICAL_WITNESSLEDGERIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type WitnessledgerizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type WitnessledgerizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: WitnessledgerizabilityRolloutCheck[]
  guidance: string
}

export type WitnessledgerizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingWitnessledgerizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateWitnessledgerizabilityRollout(
  input: WitnessledgerizabilityRolloutInput,
): WitnessledgerizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const witnessledgerizabilityTableCoverageComplete =
    input.existingWitnessledgerizabilityTableCount === CRITICAL_WITNESSLEDGERIZABILITY_TABLES.length

  const checks: WitnessledgerizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL witnessledgerizability checks can reach the database.'
            : 'Production witnessledgerizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'witnessledgerizability_signal_table_coverage',
      label: 'Witnessledgerizability signal table coverage',
      status: witnessledgerizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Witnessledgerizability signal table coverage is only enforced in production.'
          : witnessledgerizabilityTableCoverageComplete
            ? `${input.existingWitnessledgerizabilityTableCount}/${CRITICAL_WITNESSLEDGERIZABILITY_TABLES.length} witnessledgerizability signal tables are present.`
            : `${input.existingWitnessledgerizabilityTableCount}/${CRITICAL_WITNESSLEDGERIZABILITY_TABLES.length} witnessledgerizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_witnessledgerizability',
      label: 'Idempotency key witnessledgerizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key witnessledgerizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key witnessledgerizability signals.'
            : 'Production witnessledgerizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_witnessledgerizability',
      label: 'Usage event witnessledgerizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event witnessledgerizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event witnessledgerizability signals.'
            : 'Production witnessledgerizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          witnessledgerizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              witnessledgerizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production witnessledgerizability rollout requires PostgreSQL connectivity, witnessledgerizability tables, idempotency key witnessledgerizability, usage event witnessledgerizability, and full signal coverage.',
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
        ? 'Production witnessledgerizability rollout checks passed. Witnessledgerizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production witnessledgerizability rollout is not ready. Resolve failed checks before relying on production witnessledgerizability tooling.',
  }
}

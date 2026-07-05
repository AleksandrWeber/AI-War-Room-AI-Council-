import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ISOLATIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type IsolatizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type IsolatizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: IsolatizabilityRolloutCheck[]
  guidance: string
}

export type IsolatizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingIsolatizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateIsolatizabilityRollout(
  input: IsolatizabilityRolloutInput,
): IsolatizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const isolatizabilityTableCoverageComplete =
    input.existingIsolatizabilityTableCount === CRITICAL_ISOLATIZABILITY_TABLES.length

  const checks: IsolatizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL isolatizability checks can reach the database.'
            : 'Production isolatizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'isolatizability_signal_table_coverage',
      label: 'Isolatizability signal table coverage',
      status: isolatizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Isolatizability signal table coverage is only enforced in production.'
          : isolatizabilityTableCoverageComplete
            ? `${input.existingIsolatizabilityTableCount}/${CRITICAL_ISOLATIZABILITY_TABLES.length} isolatizability signal tables are present.`
            : `${input.existingIsolatizabilityTableCount}/${CRITICAL_ISOLATIZABILITY_TABLES.length} isolatizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_isolatizability',
      label: 'Idempotency key isolatizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key isolatizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key isolatizability signals.'
            : 'Production isolatizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_isolatizability',
      label: 'Usage event isolatizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event isolatizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event isolatizability signals.'
            : 'Production isolatizability rollout requires a usage_events table.',
    },
    {
      name: 'isolatization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          isolatizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              isolatizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support isolatization readiness.'
            : 'Production isolatizability rollout requires PostgreSQL connectivity, isolatizability tables, idempotency key isolatizability, usage event isolatizability, and full signal coverage.',
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
        ? 'Production isolatizability rollout checks passed. Isolatizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production isolatizability rollout is not ready. Resolve failed checks before relying on production isolatizability tooling.',
  }
}

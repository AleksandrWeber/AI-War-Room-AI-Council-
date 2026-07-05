import type { ApiEnv } from '../config/env.js'

export const CRITICAL_COORDINATIONIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type CoordinationizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CoordinationizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CoordinationizabilityRolloutCheck[]
  guidance: string
}

export type CoordinationizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCoordinationizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateCoordinationizabilityRollout(
  input: CoordinationizabilityRolloutInput,
): CoordinationizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const coordinationizabilityTableCoverageComplete =
    input.existingCoordinationizabilityTableCount === CRITICAL_COORDINATIONIZABILITY_TABLES.length

  const checks: CoordinationizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL coordinationizability checks can reach the database.'
            : 'Production coordinationizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'coordinationizability_signal_table_coverage',
      label: 'Coordinationizability signal table coverage',
      status: coordinationizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Coordinationizability signal table coverage is only enforced in production.'
          : coordinationizabilityTableCoverageComplete
            ? `${input.existingCoordinationizabilityTableCount}/${CRITICAL_COORDINATIONIZABILITY_TABLES.length} coordinationizability signal tables are present.`
            : `${input.existingCoordinationizabilityTableCount}/${CRITICAL_COORDINATIONIZABILITY_TABLES.length} coordinationizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_coordinationizability',
      label: 'Idempotency key coordinationizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key coordinationizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key coordinationizability signals.'
            : 'Production coordinationizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_coordinationizability',
      label: 'Usage event coordinationizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event coordinationizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event coordinationizability signals.'
            : 'Production coordinationizability rollout requires a usage_events table.',
    },
    {
      name: 'coordinationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          coordinationizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              coordinationizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support coordinationization readiness.'
            : 'Production coordinationizability rollout requires PostgreSQL connectivity, coordinationizability tables, idempotency key coordinationizability, usage event coordinationizability, and full signal coverage.',
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
        ? 'Production coordinationizability rollout checks passed. Coordinationizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production coordinationizability rollout is not ready. Resolve failed checks before relying on production coordinationizability tooling.',
  }
}

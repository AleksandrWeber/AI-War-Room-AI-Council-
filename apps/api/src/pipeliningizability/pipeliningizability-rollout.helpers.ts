import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PIPELININGIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type PipeliningizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type PipeliningizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: PipeliningizabilityRolloutCheck[]
  guidance: string
}

export type PipeliningizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingPipeliningizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluatePipeliningizabilityRollout(
  input: PipeliningizabilityRolloutInput,
): PipeliningizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const pipeliningizabilityTableCoverageComplete =
    input.existingPipeliningizabilityTableCount === CRITICAL_PIPELININGIZABILITY_TABLES.length

  const checks: PipeliningizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL pipeliningizability checks can reach the database.'
            : 'Production pipeliningizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'pipeliningizability_signal_table_coverage',
      label: 'Pipeliningizability signal table coverage',
      status: pipeliningizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Pipeliningizability signal table coverage is only enforced in production.'
          : pipeliningizabilityTableCoverageComplete
            ? `${input.existingPipeliningizabilityTableCount}/${CRITICAL_PIPELININGIZABILITY_TABLES.length} pipeliningizability signal tables are present.`
            : `${input.existingPipeliningizabilityTableCount}/${CRITICAL_PIPELININGIZABILITY_TABLES.length} pipeliningizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_pipeliningizability',
      label: 'Idempotency key pipeliningizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key pipeliningizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key pipeliningizability signals.'
            : 'Production pipeliningizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_pipeliningizability',
      label: 'Usage event pipeliningizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event pipeliningizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event pipeliningizability signals.'
            : 'Production pipeliningizability rollout requires a usage_events table.',
    },
    {
      name: 'pipeliningization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          pipeliningizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              pipeliningizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support pipeliningization readiness.'
            : 'Production pipeliningizability rollout requires PostgreSQL connectivity, pipeliningizability tables, idempotency key pipeliningizability, usage event pipeliningizability, and full signal coverage.',
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
        ? 'Production pipeliningizability rollout checks passed. Pipeliningizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production pipeliningizability rollout is not ready. Resolve failed checks before relying on production pipeliningizability tooling.',
  }
}

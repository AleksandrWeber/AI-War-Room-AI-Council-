import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TRACEABILIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type TraceabilizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TraceabilizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TraceabilizabilityRolloutCheck[]
  guidance: string
}

export type TraceabilizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTraceabilizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateTraceabilizabilityRollout(
  input: TraceabilizabilityRolloutInput,
): TraceabilizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const traceabilizabilityTableCoverageComplete =
    input.existingTraceabilizabilityTableCount === CRITICAL_TRACEABILIZABILITY_TABLES.length

  const checks: TraceabilizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL traceabilizability checks can reach the database.'
            : 'Production traceabilizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'traceabilizability_signal_table_coverage',
      label: 'Traceabilizability signal table coverage',
      status: traceabilizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Traceabilizability signal table coverage is only enforced in production.'
          : traceabilizabilityTableCoverageComplete
            ? `${input.existingTraceabilizabilityTableCount}/${CRITICAL_TRACEABILIZABILITY_TABLES.length} traceabilizability signal tables are present.`
            : `${input.existingTraceabilizabilityTableCount}/${CRITICAL_TRACEABILIZABILITY_TABLES.length} traceabilizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_traceabilizability',
      label: 'Idempotency key traceabilizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key traceabilizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key traceabilizability signals.'
            : 'Production traceabilizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_traceabilizability',
      label: 'Usage event traceabilizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event traceabilizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event traceabilizability signals.'
            : 'Production traceabilizability rollout requires a usage_events table.',
    },
    {
      name: 'traceabilization_readiness_signal',
      label: 'Traceabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          traceabilizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Traceabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              traceabilizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support traceabilization readiness.'
            : 'Production traceabilizability rollout requires PostgreSQL connectivity, traceabilizability tables, idempotency key traceabilizability, usage event traceabilizability, and full signal coverage.',
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
        ? 'Production traceabilizability rollout checks passed. Traceabilizability coverage and traceabilization readiness signal signals are healthy.'
        : 'Production traceabilizability rollout is not ready. Resolve failed checks before relying on production traceabilizability tooling.',
  }
}

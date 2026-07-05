import type { ApiEnv } from '../config/env.js'

export const CRITICAL_METRICIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type MetricizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type MetricizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: MetricizabilityRolloutCheck[]
  guidance: string
}

export type MetricizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingMetricizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateMetricizabilityRollout(
  input: MetricizabilityRolloutInput,
): MetricizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const metricizabilityTableCoverageComplete =
    input.existingMetricizabilityTableCount === CRITICAL_METRICIZABILITY_TABLES.length

  const checks: MetricizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL metricizability checks can reach the database.'
            : 'Production metricizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'metricizability_signal_table_coverage',
      label: 'Metricizability signal table coverage',
      status: metricizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Metricizability signal table coverage is only enforced in production.'
          : metricizabilityTableCoverageComplete
            ? `${input.existingMetricizabilityTableCount}/${CRITICAL_METRICIZABILITY_TABLES.length} metricizability signal tables are present.`
            : `${input.existingMetricizabilityTableCount}/${CRITICAL_METRICIZABILITY_TABLES.length} metricizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_metricizability',
      label: 'Idempotency key metricizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key metricizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key metricizability signals.'
            : 'Production metricizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_metricizability',
      label: 'Usage event metricizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event metricizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event metricizability signals.'
            : 'Production metricizability rollout requires a usage_events table.',
    },
    {
      name: 'metricization_readiness_signal',
      label: 'Metricization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          metricizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Metricization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              metricizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support metricization readiness.'
            : 'Production metricizability rollout requires PostgreSQL connectivity, metricizability tables, idempotency key metricizability, usage event metricizability, and full signal coverage.',
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
        ? 'Production metricizability rollout checks passed. Metricizability coverage and metricization readiness signal signals are healthy.'
        : 'Production metricizability rollout is not ready. Resolve failed checks before relying on production metricizability tooling.',
  }
}

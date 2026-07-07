import type { ApiEnv } from '../config/env.js'

export const CRITICAL_WITNESSIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type WitnessizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type WitnessizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: WitnessizabilityRolloutCheck[]
  guidance: string
}

export type WitnessizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingWitnessizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateWitnessizabilityRollout(
  input: WitnessizabilityRolloutInput,
): WitnessizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const witnessizabilityTableCoverageComplete =
    input.existingWitnessizabilityTableCount === CRITICAL_WITNESSIZABILITY_TABLES.length

  const checks: WitnessizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL witnessizability checks can reach the database.'
            : 'Production witnessizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'witnessizability_signal_table_coverage',
      label: 'Witnessizability signal table coverage',
      status: witnessizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Witnessizability signal table coverage is only enforced in production.'
          : witnessizabilityTableCoverageComplete
            ? `${input.existingWitnessizabilityTableCount}/${CRITICAL_WITNESSIZABILITY_TABLES.length} witnessizability signal tables are present.`
            : `${input.existingWitnessizabilityTableCount}/${CRITICAL_WITNESSIZABILITY_TABLES.length} witnessizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_witnessizability',
      label: 'Idempotency key witnessizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key witnessizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key witnessizability signals.'
            : 'Production witnessizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_witnessizability',
      label: 'Usage event witnessizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event witnessizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event witnessizability signals.'
            : 'Production witnessizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          witnessizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              witnessizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production witnessizability rollout requires PostgreSQL connectivity, witnessizability tables, idempotency key witnessizability, usage event witnessizability, and full signal coverage.',
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
        ? 'Production witnessizability rollout checks passed. Witnessizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production witnessizability rollout is not ready. Resolve failed checks before relying on production witnessizability tooling.',
  }
}

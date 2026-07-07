import type { ApiEnv } from '../config/env.js'

export const CRITICAL_FLEXIBILITYVAULTIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type FlexibilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type FlexibilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: FlexibilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type FlexibilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingFlexibilityvaultizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateFlexibilityvaultizabilityRollout(
  input: FlexibilityvaultizabilityRolloutInput,
): FlexibilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const flexibilityvaultizabilityTableCoverageComplete =
    input.existingFlexibilityvaultizabilityTableCount === CRITICAL_FLEXIBILITYVAULTIZABILITY_TABLES.length

  const checks: FlexibilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL flexibilityvaultizability checks can reach the database.'
            : 'Production flexibilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'flexibilityvaultizability_signal_table_coverage',
      label: 'Flexibilityvaultizability signal table coverage',
      status: flexibilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Flexibilityvaultizability signal table coverage is only enforced in production.'
          : flexibilityvaultizabilityTableCoverageComplete
            ? `${input.existingFlexibilityvaultizabilityTableCount}/${CRITICAL_FLEXIBILITYVAULTIZABILITY_TABLES.length} flexibilityvaultizability signal tables are present.`
            : `${input.existingFlexibilityvaultizabilityTableCount}/${CRITICAL_FLEXIBILITYVAULTIZABILITY_TABLES.length} flexibilityvaultizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_flexibilityvaultizability',
      label: 'Idempotency key flexibilityvaultizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key flexibilityvaultizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key flexibilityvaultizability signals.'
            : 'Production flexibilityvaultizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_flexibilityvaultizability',
      label: 'Usage event flexibilityvaultizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event flexibilityvaultizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event flexibilityvaultizability signals.'
            : 'Production flexibilityvaultizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          flexibilityvaultizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              flexibilityvaultizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production flexibilityvaultizability rollout requires PostgreSQL connectivity, flexibilityvaultizability tables, idempotency key flexibilityvaultizability, usage event flexibilityvaultizability, and full signal coverage.',
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
        ? 'Production flexibilityvaultizability rollout checks passed. Flexibilityvaultizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production flexibilityvaultizability rollout is not ready. Resolve failed checks before relying on production flexibilityvaultizability tooling.',
  }
}

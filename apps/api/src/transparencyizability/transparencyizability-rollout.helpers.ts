import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TRANSPARENCYIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type TransparencyizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TransparencyizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TransparencyizabilityRolloutCheck[]
  guidance: string
}

export type TransparencyizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTransparencyizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateTransparencyizabilityRollout(
  input: TransparencyizabilityRolloutInput,
): TransparencyizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const transparencyizabilityTableCoverageComplete =
    input.existingTransparencyizabilityTableCount === CRITICAL_TRANSPARENCYIZABILITY_TABLES.length

  const checks: TransparencyizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL transparencyizability checks can reach the database.'
            : 'Production transparencyizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'transparencyizability_signal_table_coverage',
      label: 'Transparencyizability signal table coverage',
      status: transparencyizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Transparencyizability signal table coverage is only enforced in production.'
          : transparencyizabilityTableCoverageComplete
            ? `${input.existingTransparencyizabilityTableCount}/${CRITICAL_TRANSPARENCYIZABILITY_TABLES.length} transparencyizability signal tables are present.`
            : `${input.existingTransparencyizabilityTableCount}/${CRITICAL_TRANSPARENCYIZABILITY_TABLES.length} transparencyizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_transparencyizability',
      label: 'Idempotency key transparencyizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key transparencyizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key transparencyizability signals.'
            : 'Production transparencyizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_transparencyizability',
      label: 'Usage event transparencyizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event transparencyizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event transparencyizability signals.'
            : 'Production transparencyizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          transparencyizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              transparencyizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production transparencyizability rollout requires PostgreSQL connectivity, transparencyizability tables, idempotency key transparencyizability, usage event transparencyizability, and full signal coverage.',
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
        ? 'Production transparencyizability rollout checks passed. Transparencyizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production transparencyizability rollout is not ready. Resolve failed checks before relying on production transparencyizability tooling.',
  }
}

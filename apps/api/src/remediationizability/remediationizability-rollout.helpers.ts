import type { ApiEnv } from '../config/env.js'

export const CRITICAL_REMEDIATIONIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type RemediationizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RemediationizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RemediationizabilityRolloutCheck[]
  guidance: string
}

export type RemediationizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRemediationizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateRemediationizabilityRollout(
  input: RemediationizabilityRolloutInput,
): RemediationizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const remediationizabilityTableCoverageComplete =
    input.existingRemediationizabilityTableCount === CRITICAL_REMEDIATIONIZABILITY_TABLES.length

  const checks: RemediationizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL remediationizability checks can reach the database.'
            : 'Production remediationizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'remediationizability_signal_table_coverage',
      label: 'Remediationizability signal table coverage',
      status: remediationizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Remediationizability signal table coverage is only enforced in production.'
          : remediationizabilityTableCoverageComplete
            ? `${input.existingRemediationizabilityTableCount}/${CRITICAL_REMEDIATIONIZABILITY_TABLES.length} remediationizability signal tables are present.`
            : `${input.existingRemediationizabilityTableCount}/${CRITICAL_REMEDIATIONIZABILITY_TABLES.length} remediationizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_remediationizability',
      label: 'Idempotency key remediationizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key remediationizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key remediationizability signals.'
            : 'Production remediationizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_remediationizability',
      label: 'Usage event remediationizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event remediationizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event remediationizability signals.'
            : 'Production remediationizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          remediationizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              remediationizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production remediationizability rollout requires PostgreSQL connectivity, remediationizability tables, idempotency key remediationizability, usage event remediationizability, and full signal coverage.',
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
        ? 'Production remediationizability rollout checks passed. Remediationizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production remediationizability rollout is not ready. Resolve failed checks before relying on production remediationizability tooling.',
  }
}

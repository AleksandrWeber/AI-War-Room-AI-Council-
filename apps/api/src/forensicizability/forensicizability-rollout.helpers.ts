import type { ApiEnv } from '../config/env.js'

export const CRITICAL_FORENSICIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type ForensicizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ForensicizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ForensicizabilityRolloutCheck[]
  guidance: string
}

export type ForensicizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingForensicizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateForensicizabilityRollout(
  input: ForensicizabilityRolloutInput,
): ForensicizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const forensicizabilityTableCoverageComplete =
    input.existingForensicizabilityTableCount === CRITICAL_FORENSICIZABILITY_TABLES.length

  const checks: ForensicizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL forensicizability checks can reach the database.'
            : 'Production forensicizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'forensicizability_signal_table_coverage',
      label: 'Forensicizability signal table coverage',
      status: forensicizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Forensicizability signal table coverage is only enforced in production.'
          : forensicizabilityTableCoverageComplete
            ? `${input.existingForensicizabilityTableCount}/${CRITICAL_FORENSICIZABILITY_TABLES.length} forensicizability signal tables are present.`
            : `${input.existingForensicizabilityTableCount}/${CRITICAL_FORENSICIZABILITY_TABLES.length} forensicizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_forensicizability',
      label: 'Idempotency key forensicizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key forensicizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key forensicizability signals.'
            : 'Production forensicizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_forensicizability',
      label: 'Usage event forensicizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event forensicizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event forensicizability signals.'
            : 'Production forensicizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          forensicizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              forensicizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production forensicizability rollout requires PostgreSQL connectivity, forensicizability tables, idempotency key forensicizability, usage event forensicizability, and full signal coverage.',
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
        ? 'Production forensicizability rollout checks passed. Forensicizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production forensicizability rollout is not ready. Resolve failed checks before relying on production forensicizability tooling.',
  }
}

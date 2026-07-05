import type { ApiEnv } from '../config/env.js'

export const CRITICAL_VERSIONINGIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type VersioningizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type VersioningizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: VersioningizabilityRolloutCheck[]
  guidance: string
}

export type VersioningizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingVersioningizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateVersioningizabilityRollout(
  input: VersioningizabilityRolloutInput,
): VersioningizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const versioningizabilityTableCoverageComplete =
    input.existingVersioningizabilityTableCount === CRITICAL_VERSIONINGIZABILITY_TABLES.length

  const checks: VersioningizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL versioningizability checks can reach the database.'
            : 'Production versioningizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'versioningizability_signal_table_coverage',
      label: 'Versioningizability signal table coverage',
      status: versioningizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Versioningizability signal table coverage is only enforced in production.'
          : versioningizabilityTableCoverageComplete
            ? `${input.existingVersioningizabilityTableCount}/${CRITICAL_VERSIONINGIZABILITY_TABLES.length} versioningizability signal tables are present.`
            : `${input.existingVersioningizabilityTableCount}/${CRITICAL_VERSIONINGIZABILITY_TABLES.length} versioningizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_versioningizability',
      label: 'Idempotency key versioningizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key versioningizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key versioningizability signals.'
            : 'Production versioningizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_versioningizability',
      label: 'Usage event versioningizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event versioningizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event versioningizability signals.'
            : 'Production versioningizability rollout requires a usage_events table.',
    },
    {
      name: 'versioningization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          versioningizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              versioningizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support versioningization readiness.'
            : 'Production versioningizability rollout requires PostgreSQL connectivity, versioningizability tables, idempotency key versioningizability, usage event versioningizability, and full signal coverage.',
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
        ? 'Production versioningizability rollout checks passed. Versioningizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production versioningizability rollout is not ready. Resolve failed checks before relying on production versioningizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PRIVACYIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type PrivacyizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type PrivacyizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: PrivacyizabilityRolloutCheck[]
  guidance: string
}

export type PrivacyizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingPrivacyizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluatePrivacyizabilityRollout(
  input: PrivacyizabilityRolloutInput,
): PrivacyizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const privacyizabilityTableCoverageComplete =
    input.existingPrivacyizabilityTableCount === CRITICAL_PRIVACYIZABILITY_TABLES.length

  const checks: PrivacyizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL privacyizability checks can reach the database.'
            : 'Production privacyizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'privacyizability_signal_table_coverage',
      label: 'Privacyizability signal table coverage',
      status: privacyizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Privacyizability signal table coverage is only enforced in production.'
          : privacyizabilityTableCoverageComplete
            ? `${input.existingPrivacyizabilityTableCount}/${CRITICAL_PRIVACYIZABILITY_TABLES.length} privacyizability signal tables are present.`
            : `${input.existingPrivacyizabilityTableCount}/${CRITICAL_PRIVACYIZABILITY_TABLES.length} privacyizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_privacyizability',
      label: 'Idempotency key privacyizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key privacyizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key privacyizability signals.'
            : 'Production privacyizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_privacyizability',
      label: 'Usage event privacyizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event privacyizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event privacyizability signals.'
            : 'Production privacyizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          privacyizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              privacyizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production privacyizability rollout requires PostgreSQL connectivity, privacyizability tables, idempotency key privacyizability, usage event privacyizability, and full signal coverage.',
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
        ? 'Production privacyizability rollout checks passed. Privacyizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production privacyizability rollout is not ready. Resolve failed checks before relying on production privacyizability tooling.',
  }
}

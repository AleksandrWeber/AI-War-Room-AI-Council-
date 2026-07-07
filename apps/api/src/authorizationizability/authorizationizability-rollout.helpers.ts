import type { ApiEnv } from '../config/env.js'

export const CRITICAL_AUTHORIZATIONIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type AuthorizationizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AuthorizationizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AuthorizationizabilityRolloutCheck[]
  guidance: string
}

export type AuthorizationizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAuthorizationizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateAuthorizationizabilityRollout(
  input: AuthorizationizabilityRolloutInput,
): AuthorizationizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const authorizationizabilityTableCoverageComplete =
    input.existingAuthorizationizabilityTableCount === CRITICAL_AUTHORIZATIONIZABILITY_TABLES.length

  const checks: AuthorizationizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL authorizationizability checks can reach the database.'
            : 'Production authorizationizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'authorizationizability_signal_table_coverage',
      label: 'Authorizationizability signal table coverage',
      status: authorizationizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Authorizationizability signal table coverage is only enforced in production.'
          : authorizationizabilityTableCoverageComplete
            ? `${input.existingAuthorizationizabilityTableCount}/${CRITICAL_AUTHORIZATIONIZABILITY_TABLES.length} authorizationizability signal tables are present.`
            : `${input.existingAuthorizationizabilityTableCount}/${CRITICAL_AUTHORIZATIONIZABILITY_TABLES.length} authorizationizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_authorizationizability',
      label: 'Idempotency key authorizationizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key authorizationizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key authorizationizability signals.'
            : 'Production authorizationizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_authorizationizability',
      label: 'Usage event authorizationizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event authorizationizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event authorizationizability signals.'
            : 'Production authorizationizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          authorizationizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              authorizationizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production authorizationizability rollout requires PostgreSQL connectivity, authorizationizability tables, idempotency key authorizationizability, usage event authorizationizability, and full signal coverage.',
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
        ? 'Production authorizationizability rollout checks passed. Authorizationizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production authorizationizability rollout is not ready. Resolve failed checks before relying on production authorizationizability tooling.',
  }
}

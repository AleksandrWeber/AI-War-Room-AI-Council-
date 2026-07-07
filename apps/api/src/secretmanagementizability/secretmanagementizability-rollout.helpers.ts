import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SECRETMANAGEMENTIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type SecretmanagementizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SecretmanagementizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SecretmanagementizabilityRolloutCheck[]
  guidance: string
}

export type SecretmanagementizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSecretmanagementizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateSecretmanagementizabilityRollout(
  input: SecretmanagementizabilityRolloutInput,
): SecretmanagementizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const secretmanagementizabilityTableCoverageComplete =
    input.existingSecretmanagementizabilityTableCount === CRITICAL_SECRETMANAGEMENTIZABILITY_TABLES.length

  const checks: SecretmanagementizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL secretmanagementizability checks can reach the database.'
            : 'Production secretmanagementizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'secretmanagementizability_signal_table_coverage',
      label: 'Secretmanagementizability signal table coverage',
      status: secretmanagementizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Secretmanagementizability signal table coverage is only enforced in production.'
          : secretmanagementizabilityTableCoverageComplete
            ? `${input.existingSecretmanagementizabilityTableCount}/${CRITICAL_SECRETMANAGEMENTIZABILITY_TABLES.length} secretmanagementizability signal tables are present.`
            : `${input.existingSecretmanagementizabilityTableCount}/${CRITICAL_SECRETMANAGEMENTIZABILITY_TABLES.length} secretmanagementizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_secretmanagementizability',
      label: 'Idempotency key secretmanagementizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key secretmanagementizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key secretmanagementizability signals.'
            : 'Production secretmanagementizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_secretmanagementizability',
      label: 'Usage event secretmanagementizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event secretmanagementizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event secretmanagementizability signals.'
            : 'Production secretmanagementizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          secretmanagementizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              secretmanagementizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production secretmanagementizability rollout requires PostgreSQL connectivity, secretmanagementizability tables, idempotency key secretmanagementizability, usage event secretmanagementizability, and full signal coverage.',
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
        ? 'Production secretmanagementizability rollout checks passed. Secretmanagementizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production secretmanagementizability rollout is not ready. Resolve failed checks before relying on production secretmanagementizability tooling.',
  }
}

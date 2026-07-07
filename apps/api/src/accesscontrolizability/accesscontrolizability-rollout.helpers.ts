import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ACCESSCONTROLIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type AccesscontrolizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AccesscontrolizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AccesscontrolizabilityRolloutCheck[]
  guidance: string
}

export type AccesscontrolizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAccesscontrolizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateAccesscontrolizabilityRollout(
  input: AccesscontrolizabilityRolloutInput,
): AccesscontrolizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const accesscontrolizabilityTableCoverageComplete =
    input.existingAccesscontrolizabilityTableCount === CRITICAL_ACCESSCONTROLIZABILITY_TABLES.length

  const checks: AccesscontrolizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL accesscontrolizability checks can reach the database.'
            : 'Production accesscontrolizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'accesscontrolizability_signal_table_coverage',
      label: 'Accesscontrolizability signal table coverage',
      status: accesscontrolizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Accesscontrolizability signal table coverage is only enforced in production.'
          : accesscontrolizabilityTableCoverageComplete
            ? `${input.existingAccesscontrolizabilityTableCount}/${CRITICAL_ACCESSCONTROLIZABILITY_TABLES.length} accesscontrolizability signal tables are present.`
            : `${input.existingAccesscontrolizabilityTableCount}/${CRITICAL_ACCESSCONTROLIZABILITY_TABLES.length} accesscontrolizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_accesscontrolizability',
      label: 'Idempotency key accesscontrolizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key accesscontrolizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key accesscontrolizability signals.'
            : 'Production accesscontrolizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_accesscontrolizability',
      label: 'Usage event accesscontrolizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event accesscontrolizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event accesscontrolizability signals.'
            : 'Production accesscontrolizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          accesscontrolizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              accesscontrolizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production accesscontrolizability rollout requires PostgreSQL connectivity, accesscontrolizability tables, idempotency key accesscontrolizability, usage event accesscontrolizability, and full signal coverage.',
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
        ? 'Production accesscontrolizability rollout checks passed. Accesscontrolizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production accesscontrolizability rollout is not ready. Resolve failed checks before relying on production accesscontrolizability tooling.',
  }
}

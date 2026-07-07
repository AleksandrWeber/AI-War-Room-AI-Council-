import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ENFORCEMENTIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type EnforcementizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type EnforcementizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: EnforcementizabilityRolloutCheck[]
  guidance: string
}

export type EnforcementizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingEnforcementizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateEnforcementizabilityRollout(
  input: EnforcementizabilityRolloutInput,
): EnforcementizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const enforcementizabilityTableCoverageComplete =
    input.existingEnforcementizabilityTableCount === CRITICAL_ENFORCEMENTIZABILITY_TABLES.length

  const checks: EnforcementizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL enforcementizability checks can reach the database.'
            : 'Production enforcementizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'enforcementizability_signal_table_coverage',
      label: 'Enforcementizability signal table coverage',
      status: enforcementizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Enforcementizability signal table coverage is only enforced in production.'
          : enforcementizabilityTableCoverageComplete
            ? `${input.existingEnforcementizabilityTableCount}/${CRITICAL_ENFORCEMENTIZABILITY_TABLES.length} enforcementizability signal tables are present.`
            : `${input.existingEnforcementizabilityTableCount}/${CRITICAL_ENFORCEMENTIZABILITY_TABLES.length} enforcementizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_enforcementizability',
      label: 'Idempotency key enforcementizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key enforcementizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key enforcementizability signals.'
            : 'Production enforcementizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_enforcementizability',
      label: 'Usage event enforcementizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event enforcementizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event enforcementizability signals.'
            : 'Production enforcementizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          enforcementizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              enforcementizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production enforcementizability rollout requires PostgreSQL connectivity, enforcementizability tables, idempotency key enforcementizability, usage event enforcementizability, and full signal coverage.',
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
        ? 'Production enforcementizability rollout checks passed. Enforcementizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production enforcementizability rollout is not ready. Resolve failed checks before relying on production enforcementizability tooling.',
  }
}

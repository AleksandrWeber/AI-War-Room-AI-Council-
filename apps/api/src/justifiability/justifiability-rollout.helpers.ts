import type { ApiEnv } from '../config/env.js'

export const CRITICAL_JUSTIFIABILITY_TABLES = [
  'shield_scans',
  'billing_webhook_events',
  'idempotency_keys',
] as const

export type JustifiabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type JustifiabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: JustifiabilityRolloutCheck[]
  guidance: string
}

export type JustifiabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingJustifiabilityTableCount: number
  shieldScansTableExists: boolean
  billingWebhookEventsTableExists: boolean
  idempotencyKeysTableExists: boolean
}

export function evaluateJustifiabilityRollout(
  input: JustifiabilityRolloutInput,
): JustifiabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const justifiabilityTableCoverageComplete =
    input.existingJustifiabilityTableCount === CRITICAL_JUSTIFIABILITY_TABLES.length

  const checks: JustifiabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL justifiability checks can reach the database.'
            : 'Production justifiability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'justifiability_signal_table_coverage',
      label: 'Justifiability signal table coverage',
      status: justifiabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Justifiability signal table coverage is only enforced in production.'
          : justifiabilityTableCoverageComplete
            ? `${input.existingJustifiabilityTableCount}/${CRITICAL_JUSTIFIABILITY_TABLES.length} justifiability signal tables are present.`
            : `${input.existingJustifiabilityTableCount}/${CRITICAL_JUSTIFIABILITY_TABLES.length} justifiability signal tables were found.`,
    },
    {
      name: 'shield_review_justifiability',
      label: 'Shield review justifiability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield review justifiability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield review justifiability signals.'
            : 'Production justifiability rollout requires a shield_scans table.',
    },
    {
      name: 'billing_webhook_justifiability',
      label: 'Billing webhook justifiability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook justifiability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook justifiability signals.'
            : 'Production justifiability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'rationale_readiness_signal',
      label: 'Rationale readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          justifiabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.billingWebhookEventsTableExists &&
          input.idempotencyKeysTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Rationale readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              justifiabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.billingWebhookEventsTableExists &&
              input.idempotencyKeysTableExists
            ? 'Shield reviews, billing webhook events, and idempotency keys support rationale readiness.'
            : 'Production justifiability rollout requires PostgreSQL connectivity, justifiability tables, shield review justifiability, billing webhook justifiability, and full signal coverage.',
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
        ? 'Production justifiability rollout checks passed. Justifiability coverage and rationale readiness signal signals are healthy.'
        : 'Production justifiability rollout is not ready. Resolve failed checks before relying on production justifiability tooling.',
  }
}

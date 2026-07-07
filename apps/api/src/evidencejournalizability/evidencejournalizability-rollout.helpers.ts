import type { ApiEnv } from '../config/env.js'

export const CRITICAL_EVIDENCEJOURNALIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type EvidencejournalizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type EvidencejournalizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: EvidencejournalizabilityRolloutCheck[]
  guidance: string
}

export type EvidencejournalizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingEvidencejournalizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateEvidencejournalizabilityRollout(
  input: EvidencejournalizabilityRolloutInput,
): EvidencejournalizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const evidencejournalizabilityTableCoverageComplete =
    input.existingEvidencejournalizabilityTableCount === CRITICAL_EVIDENCEJOURNALIZABILITY_TABLES.length

  const checks: EvidencejournalizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL evidencejournalizability checks can reach the database.'
            : 'Production evidencejournalizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'evidencejournalizability_signal_table_coverage',
      label: 'Evidencejournalizability signal table coverage',
      status: evidencejournalizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Evidencejournalizability signal table coverage is only enforced in production.'
          : evidencejournalizabilityTableCoverageComplete
            ? `${input.existingEvidencejournalizabilityTableCount}/${CRITICAL_EVIDENCEJOURNALIZABILITY_TABLES.length} evidencejournalizability signal tables are present.`
            : `${input.existingEvidencejournalizabilityTableCount}/${CRITICAL_EVIDENCEJOURNALIZABILITY_TABLES.length} evidencejournalizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_evidencejournalizability',
      label: 'Idempotency key evidencejournalizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key evidencejournalizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key evidencejournalizability signals.'
            : 'Production evidencejournalizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_evidencejournalizability',
      label: 'Usage event evidencejournalizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event evidencejournalizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event evidencejournalizability signals.'
            : 'Production evidencejournalizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          evidencejournalizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              evidencejournalizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production evidencejournalizability rollout requires PostgreSQL connectivity, evidencejournalizability tables, idempotency key evidencejournalizability, usage event evidencejournalizability, and full signal coverage.',
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
        ? 'Production evidencejournalizability rollout checks passed. Evidencejournalizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production evidencejournalizability rollout is not ready. Resolve failed checks before relying on production evidencejournalizability tooling.',
  }
}

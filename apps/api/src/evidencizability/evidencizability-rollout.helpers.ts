import type { ApiEnv } from '../config/env.js'

export const CRITICAL_EVIDENCIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type EvidencizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type EvidencizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: EvidencizabilityRolloutCheck[]
  guidance: string
}

export type EvidencizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingEvidencizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateEvidencizabilityRollout(
  input: EvidencizabilityRolloutInput,
): EvidencizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const evidencizabilityTableCoverageComplete =
    input.existingEvidencizabilityTableCount === CRITICAL_EVIDENCIZABILITY_TABLES.length

  const checks: EvidencizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL evidencizability checks can reach the database.'
            : 'Production evidencizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'evidencizability_signal_table_coverage',
      label: 'Evidencizability signal table coverage',
      status: evidencizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Evidencizability signal table coverage is only enforced in production.'
          : evidencizabilityTableCoverageComplete
            ? `${input.existingEvidencizabilityTableCount}/${CRITICAL_EVIDENCIZABILITY_TABLES.length} evidencizability signal tables are present.`
            : `${input.existingEvidencizabilityTableCount}/${CRITICAL_EVIDENCIZABILITY_TABLES.length} evidencizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_evidencizability',
      label: 'Idempotency key evidencizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key evidencizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key evidencizability signals.'
            : 'Production evidencizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_evidencizability',
      label: 'Usage event evidencizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event evidencizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event evidencizability signals.'
            : 'Production evidencizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          evidencizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              evidencizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production evidencizability rollout requires PostgreSQL connectivity, evidencizability tables, idempotency key evidencizability, usage event evidencizability, and full signal coverage.',
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
        ? 'Production evidencizability rollout checks passed. Evidencizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production evidencizability rollout is not ready. Resolve failed checks before relying on production evidencizability tooling.',
  }
}

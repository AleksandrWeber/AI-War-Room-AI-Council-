import type { ApiEnv } from '../config/env.js'

export const CRITICAL_EVIDENCETRACKIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type EvidencetrackizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type EvidencetrackizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: EvidencetrackizabilityRolloutCheck[]
  guidance: string
}

export type EvidencetrackizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingEvidencetrackizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateEvidencetrackizabilityRollout(
  input: EvidencetrackizabilityRolloutInput,
): EvidencetrackizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const evidencetrackizabilityTableCoverageComplete =
    input.existingEvidencetrackizabilityTableCount === CRITICAL_EVIDENCETRACKIZABILITY_TABLES.length

  const checks: EvidencetrackizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL evidencetrackizability checks can reach the database.'
            : 'Production evidencetrackizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'evidencetrackizability_signal_table_coverage',
      label: 'Evidencetrackizability signal table coverage',
      status: evidencetrackizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Evidencetrackizability signal table coverage is only enforced in production.'
          : evidencetrackizabilityTableCoverageComplete
            ? `${input.existingEvidencetrackizabilityTableCount}/${CRITICAL_EVIDENCETRACKIZABILITY_TABLES.length} evidencetrackizability signal tables are present.`
            : `${input.existingEvidencetrackizabilityTableCount}/${CRITICAL_EVIDENCETRACKIZABILITY_TABLES.length} evidencetrackizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_evidencetrackizability',
      label: 'Idempotency key evidencetrackizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key evidencetrackizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key evidencetrackizability signals.'
            : 'Production evidencetrackizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_evidencetrackizability',
      label: 'Usage event evidencetrackizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event evidencetrackizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event evidencetrackizability signals.'
            : 'Production evidencetrackizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          evidencetrackizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              evidencetrackizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production evidencetrackizability rollout requires PostgreSQL connectivity, evidencetrackizability tables, idempotency key evidencetrackizability, usage event evidencetrackizability, and full signal coverage.',
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
        ? 'Production evidencetrackizability rollout checks passed. Evidencetrackizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production evidencetrackizability rollout is not ready. Resolve failed checks before relying on production evidencetrackizability tooling.',
  }
}

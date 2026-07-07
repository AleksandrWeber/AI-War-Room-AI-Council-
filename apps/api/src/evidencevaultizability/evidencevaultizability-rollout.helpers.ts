import type { ApiEnv } from '../config/env.js'

export const CRITICAL_EVIDENCEVAULTIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type EvidencevaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type EvidencevaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: EvidencevaultizabilityRolloutCheck[]
  guidance: string
}

export type EvidencevaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingEvidencevaultizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateEvidencevaultizabilityRollout(
  input: EvidencevaultizabilityRolloutInput,
): EvidencevaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const evidencevaultizabilityTableCoverageComplete =
    input.existingEvidencevaultizabilityTableCount === CRITICAL_EVIDENCEVAULTIZABILITY_TABLES.length

  const checks: EvidencevaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL evidencevaultizability checks can reach the database.'
            : 'Production evidencevaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'evidencevaultizability_signal_table_coverage',
      label: 'Evidencevaultizability signal table coverage',
      status: evidencevaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Evidencevaultizability signal table coverage is only enforced in production.'
          : evidencevaultizabilityTableCoverageComplete
            ? `${input.existingEvidencevaultizabilityTableCount}/${CRITICAL_EVIDENCEVAULTIZABILITY_TABLES.length} evidencevaultizability signal tables are present.`
            : `${input.existingEvidencevaultizabilityTableCount}/${CRITICAL_EVIDENCEVAULTIZABILITY_TABLES.length} evidencevaultizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_evidencevaultizability',
      label: 'Idempotency key evidencevaultizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key evidencevaultizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key evidencevaultizability signals.'
            : 'Production evidencevaultizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_evidencevaultizability',
      label: 'Usage event evidencevaultizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event evidencevaultizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event evidencevaultizability signals.'
            : 'Production evidencevaultizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          evidencevaultizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              evidencevaultizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production evidencevaultizability rollout requires PostgreSQL connectivity, evidencevaultizability tables, idempotency key evidencevaultizability, usage event evidencevaultizability, and full signal coverage.',
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
        ? 'Production evidencevaultizability rollout checks passed. Evidencevaultizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production evidencevaultizability rollout is not ready. Resolve failed checks before relying on production evidencevaultizability tooling.',
  }
}

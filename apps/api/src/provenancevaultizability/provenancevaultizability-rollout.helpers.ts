import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PROVENANCEVAULTIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type ProvenancevaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ProvenancevaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ProvenancevaultizabilityRolloutCheck[]
  guidance: string
}

export type ProvenancevaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingProvenancevaultizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateProvenancevaultizabilityRollout(
  input: ProvenancevaultizabilityRolloutInput,
): ProvenancevaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const provenancevaultizabilityTableCoverageComplete =
    input.existingProvenancevaultizabilityTableCount === CRITICAL_PROVENANCEVAULTIZABILITY_TABLES.length

  const checks: ProvenancevaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL provenancevaultizability checks can reach the database.'
            : 'Production provenancevaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'provenancevaultizability_signal_table_coverage',
      label: 'Provenancevaultizability signal table coverage',
      status: provenancevaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provenancevaultizability signal table coverage is only enforced in production.'
          : provenancevaultizabilityTableCoverageComplete
            ? `${input.existingProvenancevaultizabilityTableCount}/${CRITICAL_PROVENANCEVAULTIZABILITY_TABLES.length} provenancevaultizability signal tables are present.`
            : `${input.existingProvenancevaultizabilityTableCount}/${CRITICAL_PROVENANCEVAULTIZABILITY_TABLES.length} provenancevaultizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_provenancevaultizability',
      label: 'Idempotency key provenancevaultizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key provenancevaultizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key provenancevaultizability signals.'
            : 'Production provenancevaultizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_provenancevaultizability',
      label: 'Usage event provenancevaultizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event provenancevaultizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event provenancevaultizability signals.'
            : 'Production provenancevaultizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          provenancevaultizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              provenancevaultizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production provenancevaultizability rollout requires PostgreSQL connectivity, provenancevaultizability tables, idempotency key provenancevaultizability, usage event provenancevaultizability, and full signal coverage.',
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
        ? 'Production provenancevaultizability rollout checks passed. Provenancevaultizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production provenancevaultizability rollout is not ready. Resolve failed checks before relying on production provenancevaultizability tooling.',
  }
}

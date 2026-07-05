import type { ApiEnv } from '../config/env.js'

export const CRITICAL_THESAURUSIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type ThesaurusizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ThesaurusizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ThesaurusizabilityRolloutCheck[]
  guidance: string
}

export type ThesaurusizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingThesaurusizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateThesaurusizabilityRollout(
  input: ThesaurusizabilityRolloutInput,
): ThesaurusizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const thesaurusizabilityTableCoverageComplete =
    input.existingThesaurusizabilityTableCount === CRITICAL_THESAURUSIZABILITY_TABLES.length

  const checks: ThesaurusizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL thesaurusizability checks can reach the database.'
            : 'Production thesaurusizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'thesaurusizability_signal_table_coverage',
      label: 'Thesaurusizability signal table coverage',
      status: thesaurusizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Thesaurusizability signal table coverage is only enforced in production.'
          : thesaurusizabilityTableCoverageComplete
            ? `${input.existingThesaurusizabilityTableCount}/${CRITICAL_THESAURUSIZABILITY_TABLES.length} thesaurusizability signal tables are present.`
            : `${input.existingThesaurusizabilityTableCount}/${CRITICAL_THESAURUSIZABILITY_TABLES.length} thesaurusizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_thesaurusizability',
      label: 'Idempotency key thesaurusizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key thesaurusizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key thesaurusizability signals.'
            : 'Production thesaurusizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_thesaurusizability',
      label: 'Usage event thesaurusizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event thesaurusizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event thesaurusizability signals.'
            : 'Production thesaurusizability rollout requires a usage_events table.',
    },
    {
      name: 'thesaurization_readiness_signal',
      label: 'Thesaurization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          thesaurusizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Thesaurization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              thesaurusizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support thesaurization readiness.'
            : 'Production thesaurusizability rollout requires PostgreSQL connectivity, thesaurusizability tables, idempotency key thesaurusizability, usage event thesaurusizability, and full signal coverage.',
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
        ? 'Production thesaurusizability rollout checks passed. Thesaurusizability coverage and thesaurization readiness signal signals are healthy.'
        : 'Production thesaurusizability rollout is not ready. Resolve failed checks before relying on production thesaurusizability tooling.',
  }
}

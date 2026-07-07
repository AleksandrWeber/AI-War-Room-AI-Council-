import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DISCLOSUREIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type DisclosureizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DisclosureizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DisclosureizabilityRolloutCheck[]
  guidance: string
}

export type DisclosureizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDisclosureizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateDisclosureizabilityRollout(
  input: DisclosureizabilityRolloutInput,
): DisclosureizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const disclosureizabilityTableCoverageComplete =
    input.existingDisclosureizabilityTableCount === CRITICAL_DISCLOSUREIZABILITY_TABLES.length

  const checks: DisclosureizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL disclosureizability checks can reach the database.'
            : 'Production disclosureizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'disclosureizability_signal_table_coverage',
      label: 'Disclosureizability signal table coverage',
      status: disclosureizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Disclosureizability signal table coverage is only enforced in production.'
          : disclosureizabilityTableCoverageComplete
            ? `${input.existingDisclosureizabilityTableCount}/${CRITICAL_DISCLOSUREIZABILITY_TABLES.length} disclosureizability signal tables are present.`
            : `${input.existingDisclosureizabilityTableCount}/${CRITICAL_DISCLOSUREIZABILITY_TABLES.length} disclosureizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_disclosureizability',
      label: 'Idempotency key disclosureizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key disclosureizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key disclosureizability signals.'
            : 'Production disclosureizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_disclosureizability',
      label: 'Usage event disclosureizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event disclosureizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event disclosureizability signals.'
            : 'Production disclosureizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          disclosureizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              disclosureizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production disclosureizability rollout requires PostgreSQL connectivity, disclosureizability tables, idempotency key disclosureizability, usage event disclosureizability, and full signal coverage.',
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
        ? 'Production disclosureizability rollout checks passed. Disclosureizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production disclosureizability rollout is not ready. Resolve failed checks before relying on production disclosureizability tooling.',
  }
}

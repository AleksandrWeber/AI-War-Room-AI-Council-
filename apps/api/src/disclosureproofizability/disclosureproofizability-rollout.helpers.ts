import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DISCLOSUREPROOFIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type DisclosureproofizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DisclosureproofizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DisclosureproofizabilityRolloutCheck[]
  guidance: string
}

export type DisclosureproofizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDisclosureproofizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateDisclosureproofizabilityRollout(
  input: DisclosureproofizabilityRolloutInput,
): DisclosureproofizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const disclosureproofizabilityTableCoverageComplete =
    input.existingDisclosureproofizabilityTableCount === CRITICAL_DISCLOSUREPROOFIZABILITY_TABLES.length

  const checks: DisclosureproofizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL disclosureproofizability checks can reach the database.'
            : 'Production disclosureproofizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'disclosureproofizability_signal_table_coverage',
      label: 'Disclosureproofizability signal table coverage',
      status: disclosureproofizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Disclosureproofizability signal table coverage is only enforced in production.'
          : disclosureproofizabilityTableCoverageComplete
            ? `${input.existingDisclosureproofizabilityTableCount}/${CRITICAL_DISCLOSUREPROOFIZABILITY_TABLES.length} disclosureproofizability signal tables are present.`
            : `${input.existingDisclosureproofizabilityTableCount}/${CRITICAL_DISCLOSUREPROOFIZABILITY_TABLES.length} disclosureproofizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_disclosureproofizability',
      label: 'Idempotency key disclosureproofizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key disclosureproofizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key disclosureproofizability signals.'
            : 'Production disclosureproofizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_disclosureproofizability',
      label: 'Usage event disclosureproofizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event disclosureproofizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event disclosureproofizability signals.'
            : 'Production disclosureproofizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          disclosureproofizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              disclosureproofizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production disclosureproofizability rollout requires PostgreSQL connectivity, disclosureproofizability tables, idempotency key disclosureproofizability, usage event disclosureproofizability, and full signal coverage.',
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
        ? 'Production disclosureproofizability rollout checks passed. Disclosureproofizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production disclosureproofizability rollout is not ready. Resolve failed checks before relying on production disclosureproofizability tooling.',
  }
}

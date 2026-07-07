import type { ApiEnv } from '../config/env.js'

export const CRITICAL_INTERCHANGEABILITYVAULTIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type InterchangeabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type InterchangeabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: InterchangeabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type InterchangeabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingInterchangeabilityvaultizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateInterchangeabilityvaultizabilityRollout(
  input: InterchangeabilityvaultizabilityRolloutInput,
): InterchangeabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const interchangeabilityvaultizabilityTableCoverageComplete =
    input.existingInterchangeabilityvaultizabilityTableCount === CRITICAL_INTERCHANGEABILITYVAULTIZABILITY_TABLES.length

  const checks: InterchangeabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL interchangeabilityvaultizability checks can reach the database.'
            : 'Production interchangeabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'interchangeabilityvaultizability_signal_table_coverage',
      label: 'Interchangeabilityvaultizability signal table coverage',
      status: interchangeabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Interchangeabilityvaultizability signal table coverage is only enforced in production.'
          : interchangeabilityvaultizabilityTableCoverageComplete
            ? `${input.existingInterchangeabilityvaultizabilityTableCount}/${CRITICAL_INTERCHANGEABILITYVAULTIZABILITY_TABLES.length} interchangeabilityvaultizability signal tables are present.`
            : `${input.existingInterchangeabilityvaultizabilityTableCount}/${CRITICAL_INTERCHANGEABILITYVAULTIZABILITY_TABLES.length} interchangeabilityvaultizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_interchangeabilityvaultizability',
      label: 'Idempotency key interchangeabilityvaultizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key interchangeabilityvaultizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key interchangeabilityvaultizability signals.'
            : 'Production interchangeabilityvaultizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_interchangeabilityvaultizability',
      label: 'Usage event interchangeabilityvaultizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event interchangeabilityvaultizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event interchangeabilityvaultizability signals.'
            : 'Production interchangeabilityvaultizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          interchangeabilityvaultizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              interchangeabilityvaultizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production interchangeabilityvaultizability rollout requires PostgreSQL connectivity, interchangeabilityvaultizability tables, idempotency key interchangeabilityvaultizability, usage event interchangeabilityvaultizability, and full signal coverage.',
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
        ? 'Production interchangeabilityvaultizability rollout checks passed. Interchangeabilityvaultizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production interchangeabilityvaultizability rollout is not ready. Resolve failed checks before relying on production interchangeabilityvaultizability tooling.',
  }
}

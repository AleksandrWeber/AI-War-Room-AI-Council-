import type { ApiEnv } from '../config/env.js'

export const CRITICAL_RETRIEVABILITYVAULTIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type RetrievabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RetrievabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RetrievabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type RetrievabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRetrievabilityvaultizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateRetrievabilityvaultizabilityRollout(
  input: RetrievabilityvaultizabilityRolloutInput,
): RetrievabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const retrievabilityvaultizabilityTableCoverageComplete =
    input.existingRetrievabilityvaultizabilityTableCount === CRITICAL_RETRIEVABILITYVAULTIZABILITY_TABLES.length

  const checks: RetrievabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL retrievabilityvaultizability checks can reach the database.'
            : 'Production retrievabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'retrievabilityvaultizability_signal_table_coverage',
      label: 'Retrievabilityvaultizability signal table coverage',
      status: retrievabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Retrievabilityvaultizability signal table coverage is only enforced in production.'
          : retrievabilityvaultizabilityTableCoverageComplete
            ? `${input.existingRetrievabilityvaultizabilityTableCount}/${CRITICAL_RETRIEVABILITYVAULTIZABILITY_TABLES.length} retrievabilityvaultizability signal tables are present.`
            : `${input.existingRetrievabilityvaultizabilityTableCount}/${CRITICAL_RETRIEVABILITYVAULTIZABILITY_TABLES.length} retrievabilityvaultizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_retrievabilityvaultizability',
      label: 'Idempotency key retrievabilityvaultizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key retrievabilityvaultizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key retrievabilityvaultizability signals.'
            : 'Production retrievabilityvaultizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_retrievabilityvaultizability',
      label: 'Usage event retrievabilityvaultizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event retrievabilityvaultizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event retrievabilityvaultizability signals.'
            : 'Production retrievabilityvaultizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          retrievabilityvaultizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              retrievabilityvaultizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production retrievabilityvaultizability rollout requires PostgreSQL connectivity, retrievabilityvaultizability tables, idempotency key retrievabilityvaultizability, usage event retrievabilityvaultizability, and full signal coverage.',
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
        ? 'Production retrievabilityvaultizability rollout checks passed. Retrievabilityvaultizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production retrievabilityvaultizability rollout is not ready. Resolve failed checks before relying on production retrievabilityvaultizability tooling.',
  }
}

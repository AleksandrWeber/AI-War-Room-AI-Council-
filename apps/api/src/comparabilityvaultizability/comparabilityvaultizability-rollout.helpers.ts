import type { ApiEnv } from '../config/env.js'

export const CRITICAL_COMPARABILITYVAULTIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type ComparabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ComparabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ComparabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type ComparabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingComparabilityvaultizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateComparabilityvaultizabilityRollout(
  input: ComparabilityvaultizabilityRolloutInput,
): ComparabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const comparabilityvaultizabilityTableCoverageComplete =
    input.existingComparabilityvaultizabilityTableCount === CRITICAL_COMPARABILITYVAULTIZABILITY_TABLES.length

  const checks: ComparabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL comparabilityvaultizability checks can reach the database.'
            : 'Production comparabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'comparabilityvaultizability_signal_table_coverage',
      label: 'Comparabilityvaultizability signal table coverage',
      status: comparabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Comparabilityvaultizability signal table coverage is only enforced in production.'
          : comparabilityvaultizabilityTableCoverageComplete
            ? `${input.existingComparabilityvaultizabilityTableCount}/${CRITICAL_COMPARABILITYVAULTIZABILITY_TABLES.length} comparabilityvaultizability signal tables are present.`
            : `${input.existingComparabilityvaultizabilityTableCount}/${CRITICAL_COMPARABILITYVAULTIZABILITY_TABLES.length} comparabilityvaultizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_comparabilityvaultizability',
      label: 'Idempotency key comparabilityvaultizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key comparabilityvaultizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key comparabilityvaultizability signals.'
            : 'Production comparabilityvaultizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_comparabilityvaultizability',
      label: 'Usage event comparabilityvaultizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event comparabilityvaultizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event comparabilityvaultizability signals.'
            : 'Production comparabilityvaultizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          comparabilityvaultizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              comparabilityvaultizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production comparabilityvaultizability rollout requires PostgreSQL connectivity, comparabilityvaultizability tables, idempotency key comparabilityvaultizability, usage event comparabilityvaultizability, and full signal coverage.',
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
        ? 'Production comparabilityvaultizability rollout checks passed. Comparabilityvaultizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production comparabilityvaultizability rollout is not ready. Resolve failed checks before relying on production comparabilityvaultizability tooling.',
  }
}

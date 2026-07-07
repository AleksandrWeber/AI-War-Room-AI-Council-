import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DEMONSTRABILITYVAULTIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type DemonstrabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DemonstrabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DemonstrabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type DemonstrabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDemonstrabilityvaultizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateDemonstrabilityvaultizabilityRollout(
  input: DemonstrabilityvaultizabilityRolloutInput,
): DemonstrabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const demonstrabilityvaultizabilityTableCoverageComplete =
    input.existingDemonstrabilityvaultizabilityTableCount === CRITICAL_DEMONSTRABILITYVAULTIZABILITY_TABLES.length

  const checks: DemonstrabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL demonstrabilityvaultizability checks can reach the database.'
            : 'Production demonstrabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'demonstrabilityvaultizability_signal_table_coverage',
      label: 'Demonstrabilityvaultizability signal table coverage',
      status: demonstrabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Demonstrabilityvaultizability signal table coverage is only enforced in production.'
          : demonstrabilityvaultizabilityTableCoverageComplete
            ? `${input.existingDemonstrabilityvaultizabilityTableCount}/${CRITICAL_DEMONSTRABILITYVAULTIZABILITY_TABLES.length} demonstrabilityvaultizability signal tables are present.`
            : `${input.existingDemonstrabilityvaultizabilityTableCount}/${CRITICAL_DEMONSTRABILITYVAULTIZABILITY_TABLES.length} demonstrabilityvaultizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_demonstrabilityvaultizability',
      label: 'Idempotency key demonstrabilityvaultizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key demonstrabilityvaultizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key demonstrabilityvaultizability signals.'
            : 'Production demonstrabilityvaultizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_demonstrabilityvaultizability',
      label: 'Usage event demonstrabilityvaultizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event demonstrabilityvaultizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event demonstrabilityvaultizability signals.'
            : 'Production demonstrabilityvaultizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          demonstrabilityvaultizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              demonstrabilityvaultizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production demonstrabilityvaultizability rollout requires PostgreSQL connectivity, demonstrabilityvaultizability tables, idempotency key demonstrabilityvaultizability, usage event demonstrabilityvaultizability, and full signal coverage.',
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
        ? 'Production demonstrabilityvaultizability rollout checks passed. Demonstrabilityvaultizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production demonstrabilityvaultizability rollout is not ready. Resolve failed checks before relying on production demonstrabilityvaultizability tooling.',
  }
}

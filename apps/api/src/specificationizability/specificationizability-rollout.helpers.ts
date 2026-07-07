import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SPECIFICATIONIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type SpecificationizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SpecificationizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SpecificationizabilityRolloutCheck[]
  guidance: string
}

export type SpecificationizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSpecificationizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateSpecificationizabilityRollout(
  input: SpecificationizabilityRolloutInput,
): SpecificationizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const specificationizabilityTableCoverageComplete =
    input.existingSpecificationizabilityTableCount === CRITICAL_SPECIFICATIONIZABILITY_TABLES.length

  const checks: SpecificationizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL specificationizability checks can reach the database.'
            : 'Production specificationizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'specificationizability_signal_table_coverage',
      label: 'Specificationizability signal table coverage',
      status: specificationizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Specificationizability signal table coverage is only enforced in production.'
          : specificationizabilityTableCoverageComplete
            ? `${input.existingSpecificationizabilityTableCount}/${CRITICAL_SPECIFICATIONIZABILITY_TABLES.length} specificationizability signal tables are present.`
            : `${input.existingSpecificationizabilityTableCount}/${CRITICAL_SPECIFICATIONIZABILITY_TABLES.length} specificationizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_specificationizability',
      label: 'Idempotency key specificationizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key specificationizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key specificationizability signals.'
            : 'Production specificationizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_specificationizability',
      label: 'Usage event specificationizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event specificationizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event specificationizability signals.'
            : 'Production specificationizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          specificationizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              specificationizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production specificationizability rollout requires PostgreSQL connectivity, specificationizability tables, idempotency key specificationizability, usage event specificationizability, and full signal coverage.',
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
        ? 'Production specificationizability rollout checks passed. Specificationizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production specificationizability rollout is not ready. Resolve failed checks before relying on production specificationizability tooling.',
  }
}

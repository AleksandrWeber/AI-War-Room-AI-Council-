import type { ApiEnv } from '../config/env.js'

export const CRITICAL_MITIGATIONIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type MitigationizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type MitigationizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: MitigationizabilityRolloutCheck[]
  guidance: string
}

export type MitigationizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingMitigationizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateMitigationizabilityRollout(
  input: MitigationizabilityRolloutInput,
): MitigationizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const mitigationizabilityTableCoverageComplete =
    input.existingMitigationizabilityTableCount === CRITICAL_MITIGATIONIZABILITY_TABLES.length

  const checks: MitigationizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL mitigationizability checks can reach the database.'
            : 'Production mitigationizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'mitigationizability_signal_table_coverage',
      label: 'Mitigationizability signal table coverage',
      status: mitigationizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Mitigationizability signal table coverage is only enforced in production.'
          : mitigationizabilityTableCoverageComplete
            ? `${input.existingMitigationizabilityTableCount}/${CRITICAL_MITIGATIONIZABILITY_TABLES.length} mitigationizability signal tables are present.`
            : `${input.existingMitigationizabilityTableCount}/${CRITICAL_MITIGATIONIZABILITY_TABLES.length} mitigationizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_mitigationizability',
      label: 'Idempotency key mitigationizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key mitigationizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key mitigationizability signals.'
            : 'Production mitigationizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_mitigationizability',
      label: 'Usage event mitigationizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event mitigationizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event mitigationizability signals.'
            : 'Production mitigationizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          mitigationizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              mitigationizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production mitigationizability rollout requires PostgreSQL connectivity, mitigationizability tables, idempotency key mitigationizability, usage event mitigationizability, and full signal coverage.',
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
        ? 'Production mitigationizability rollout checks passed. Mitigationizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production mitigationizability rollout is not ready. Resolve failed checks before relying on production mitigationizability tooling.',
  }
}

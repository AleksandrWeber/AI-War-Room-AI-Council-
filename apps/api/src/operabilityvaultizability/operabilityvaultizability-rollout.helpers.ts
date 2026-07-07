import type { ApiEnv } from '../config/env.js'

export const CRITICAL_OPERABILITYVAULTIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type OperabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type OperabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: OperabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type OperabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingOperabilityvaultizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateOperabilityvaultizabilityRollout(
  input: OperabilityvaultizabilityRolloutInput,
): OperabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const operabilityvaultizabilityTableCoverageComplete =
    input.existingOperabilityvaultizabilityTableCount === CRITICAL_OPERABILITYVAULTIZABILITY_TABLES.length

  const checks: OperabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL operabilityvaultizability checks can reach the database.'
            : 'Production operabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'operabilityvaultizability_signal_table_coverage',
      label: 'Operabilityvaultizability signal table coverage',
      status: operabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Operabilityvaultizability signal table coverage is only enforced in production.'
          : operabilityvaultizabilityTableCoverageComplete
            ? `${input.existingOperabilityvaultizabilityTableCount}/${CRITICAL_OPERABILITYVAULTIZABILITY_TABLES.length} operabilityvaultizability signal tables are present.`
            : `${input.existingOperabilityvaultizabilityTableCount}/${CRITICAL_OPERABILITYVAULTIZABILITY_TABLES.length} operabilityvaultizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_operabilityvaultizability',
      label: 'Idempotency key operabilityvaultizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key operabilityvaultizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key operabilityvaultizability signals.'
            : 'Production operabilityvaultizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_operabilityvaultizability',
      label: 'Usage event operabilityvaultizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event operabilityvaultizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event operabilityvaultizability signals.'
            : 'Production operabilityvaultizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          operabilityvaultizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              operabilityvaultizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production operabilityvaultizability rollout requires PostgreSQL connectivity, operabilityvaultizability tables, idempotency key operabilityvaultizability, usage event operabilityvaultizability, and full signal coverage.',
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
        ? 'Production operabilityvaultizability rollout checks passed. Operabilityvaultizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production operabilityvaultizability rollout is not ready. Resolve failed checks before relying on production operabilityvaultizability tooling.',
  }
}

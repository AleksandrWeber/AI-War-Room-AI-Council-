import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DEPENDABILITYVAULTIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type DependabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DependabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DependabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type DependabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDependabilityvaultizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateDependabilityvaultizabilityRollout(
  input: DependabilityvaultizabilityRolloutInput,
): DependabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const dependabilityvaultizabilityTableCoverageComplete =
    input.existingDependabilityvaultizabilityTableCount === CRITICAL_DEPENDABILITYVAULTIZABILITY_TABLES.length

  const checks: DependabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL dependabilityvaultizability checks can reach the database.'
            : 'Production dependabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'dependabilityvaultizability_signal_table_coverage',
      label: 'Dependabilityvaultizability signal table coverage',
      status: dependabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Dependabilityvaultizability signal table coverage is only enforced in production.'
          : dependabilityvaultizabilityTableCoverageComplete
            ? `${input.existingDependabilityvaultizabilityTableCount}/${CRITICAL_DEPENDABILITYVAULTIZABILITY_TABLES.length} dependabilityvaultizability signal tables are present.`
            : `${input.existingDependabilityvaultizabilityTableCount}/${CRITICAL_DEPENDABILITYVAULTIZABILITY_TABLES.length} dependabilityvaultizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_dependabilityvaultizability',
      label: 'Idempotency key dependabilityvaultizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key dependabilityvaultizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key dependabilityvaultizability signals.'
            : 'Production dependabilityvaultizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_dependabilityvaultizability',
      label: 'Usage event dependabilityvaultizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event dependabilityvaultizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event dependabilityvaultizability signals.'
            : 'Production dependabilityvaultizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          dependabilityvaultizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              dependabilityvaultizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production dependabilityvaultizability rollout requires PostgreSQL connectivity, dependabilityvaultizability tables, idempotency key dependabilityvaultizability, usage event dependabilityvaultizability, and full signal coverage.',
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
        ? 'Production dependabilityvaultizability rollout checks passed. Dependabilityvaultizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production dependabilityvaultizability rollout is not ready. Resolve failed checks before relying on production dependabilityvaultizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_INSPECTABILITYVAULTIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type InspectabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type InspectabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: InspectabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type InspectabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingInspectabilityvaultizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateInspectabilityvaultizabilityRollout(
  input: InspectabilityvaultizabilityRolloutInput,
): InspectabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const inspectabilityvaultizabilityTableCoverageComplete =
    input.existingInspectabilityvaultizabilityTableCount === CRITICAL_INSPECTABILITYVAULTIZABILITY_TABLES.length

  const checks: InspectabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL inspectabilityvaultizability checks can reach the database.'
            : 'Production inspectabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'inspectabilityvaultizability_signal_table_coverage',
      label: 'Inspectabilityvaultizability signal table coverage',
      status: inspectabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Inspectabilityvaultizability signal table coverage is only enforced in production.'
          : inspectabilityvaultizabilityTableCoverageComplete
            ? `${input.existingInspectabilityvaultizabilityTableCount}/${CRITICAL_INSPECTABILITYVAULTIZABILITY_TABLES.length} inspectabilityvaultizability signal tables are present.`
            : `${input.existingInspectabilityvaultizabilityTableCount}/${CRITICAL_INSPECTABILITYVAULTIZABILITY_TABLES.length} inspectabilityvaultizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_inspectabilityvaultizability',
      label: 'Idempotency key inspectabilityvaultizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key inspectabilityvaultizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key inspectabilityvaultizability signals.'
            : 'Production inspectabilityvaultizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_inspectabilityvaultizability',
      label: 'Usage event inspectabilityvaultizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event inspectabilityvaultizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event inspectabilityvaultizability signals.'
            : 'Production inspectabilityvaultizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          inspectabilityvaultizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              inspectabilityvaultizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production inspectabilityvaultizability rollout requires PostgreSQL connectivity, inspectabilityvaultizability tables, idempotency key inspectabilityvaultizability, usage event inspectabilityvaultizability, and full signal coverage.',
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
        ? 'Production inspectabilityvaultizability rollout checks passed. Inspectabilityvaultizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production inspectabilityvaultizability rollout is not ready. Resolve failed checks before relying on production inspectabilityvaultizability tooling.',
  }
}

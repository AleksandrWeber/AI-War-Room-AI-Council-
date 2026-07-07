import type { ApiEnv } from '../config/env.js'

export const CRITICAL_MANAGEABILITYVAULTIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type ManageabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ManageabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ManageabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type ManageabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingManageabilityvaultizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateManageabilityvaultizabilityRollout(
  input: ManageabilityvaultizabilityRolloutInput,
): ManageabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const manageabilityvaultizabilityTableCoverageComplete =
    input.existingManageabilityvaultizabilityTableCount === CRITICAL_MANAGEABILITYVAULTIZABILITY_TABLES.length

  const checks: ManageabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL manageabilityvaultizability checks can reach the database.'
            : 'Production manageabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'manageabilityvaultizability_signal_table_coverage',
      label: 'Manageabilityvaultizability signal table coverage',
      status: manageabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Manageabilityvaultizability signal table coverage is only enforced in production.'
          : manageabilityvaultizabilityTableCoverageComplete
            ? `${input.existingManageabilityvaultizabilityTableCount}/${CRITICAL_MANAGEABILITYVAULTIZABILITY_TABLES.length} manageabilityvaultizability signal tables are present.`
            : `${input.existingManageabilityvaultizabilityTableCount}/${CRITICAL_MANAGEABILITYVAULTIZABILITY_TABLES.length} manageabilityvaultizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_manageabilityvaultizability',
      label: 'Idempotency key manageabilityvaultizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key manageabilityvaultizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key manageabilityvaultizability signals.'
            : 'Production manageabilityvaultizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_manageabilityvaultizability',
      label: 'Usage event manageabilityvaultizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event manageabilityvaultizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event manageabilityvaultizability signals.'
            : 'Production manageabilityvaultizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          manageabilityvaultizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              manageabilityvaultizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production manageabilityvaultizability rollout requires PostgreSQL connectivity, manageabilityvaultizability tables, idempotency key manageabilityvaultizability, usage event manageabilityvaultizability, and full signal coverage.',
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
        ? 'Production manageabilityvaultizability rollout checks passed. Manageabilityvaultizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production manageabilityvaultizability rollout is not ready. Resolve failed checks before relying on production manageabilityvaultizability tooling.',
  }
}

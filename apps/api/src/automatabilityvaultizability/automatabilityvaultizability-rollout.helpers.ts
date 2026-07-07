import type { ApiEnv } from '../config/env.js'

export const CRITICAL_AUTOMATABILITYVAULTIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type AutomatabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AutomatabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AutomatabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type AutomatabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAutomatabilityvaultizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateAutomatabilityvaultizabilityRollout(
  input: AutomatabilityvaultizabilityRolloutInput,
): AutomatabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const automatabilityvaultizabilityTableCoverageComplete =
    input.existingAutomatabilityvaultizabilityTableCount === CRITICAL_AUTOMATABILITYVAULTIZABILITY_TABLES.length

  const checks: AutomatabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL automatabilityvaultizability checks can reach the database.'
            : 'Production automatabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'automatabilityvaultizability_signal_table_coverage',
      label: 'Automatabilityvaultizability signal table coverage',
      status: automatabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Automatabilityvaultizability signal table coverage is only enforced in production.'
          : automatabilityvaultizabilityTableCoverageComplete
            ? `${input.existingAutomatabilityvaultizabilityTableCount}/${CRITICAL_AUTOMATABILITYVAULTIZABILITY_TABLES.length} automatabilityvaultizability signal tables are present.`
            : `${input.existingAutomatabilityvaultizabilityTableCount}/${CRITICAL_AUTOMATABILITYVAULTIZABILITY_TABLES.length} automatabilityvaultizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_automatabilityvaultizability',
      label: 'Idempotency key automatabilityvaultizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key automatabilityvaultizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key automatabilityvaultizability signals.'
            : 'Production automatabilityvaultizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_automatabilityvaultizability',
      label: 'Usage event automatabilityvaultizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event automatabilityvaultizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event automatabilityvaultizability signals.'
            : 'Production automatabilityvaultizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          automatabilityvaultizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              automatabilityvaultizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production automatabilityvaultizability rollout requires PostgreSQL connectivity, automatabilityvaultizability tables, idempotency key automatabilityvaultizability, usage event automatabilityvaultizability, and full signal coverage.',
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
        ? 'Production automatabilityvaultizability rollout checks passed. Automatabilityvaultizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production automatabilityvaultizability rollout is not ready. Resolve failed checks before relying on production automatabilityvaultizability tooling.',
  }
}

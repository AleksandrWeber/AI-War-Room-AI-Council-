import type { ApiEnv } from '../config/env.js'

export const CRITICAL_HERMENEUTIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type HermeneutizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type HermeneutizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: HermeneutizabilityRolloutCheck[]
  guidance: string
}

export type HermeneutizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingHermeneutizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateHermeneutizabilityRollout(
  input: HermeneutizabilityRolloutInput,
): HermeneutizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const hermeneutizabilityTableCoverageComplete =
    input.existingHermeneutizabilityTableCount === CRITICAL_HERMENEUTIZABILITY_TABLES.length

  const checks: HermeneutizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL hermeneutizability checks can reach the database.'
            : 'Production hermeneutizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'hermeneutizability_signal_table_coverage',
      label: 'Hermeneutizability signal table coverage',
      status: hermeneutizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Hermeneutizability signal table coverage is only enforced in production.'
          : hermeneutizabilityTableCoverageComplete
            ? `${input.existingHermeneutizabilityTableCount}/${CRITICAL_HERMENEUTIZABILITY_TABLES.length} hermeneutizability signal tables are present.`
            : `${input.existingHermeneutizabilityTableCount}/${CRITICAL_HERMENEUTIZABILITY_TABLES.length} hermeneutizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_hermeneutizability',
      label: 'Idempotency key hermeneutizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key hermeneutizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key hermeneutizability signals.'
            : 'Production hermeneutizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_hermeneutizability',
      label: 'Usage event hermeneutizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event hermeneutizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event hermeneutizability signals.'
            : 'Production hermeneutizability rollout requires a usage_events table.',
    },
    {
      name: 'hermeneutic_readiness_signal',
      label: 'Hermeneutic readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          hermeneutizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Hermeneutic readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              hermeneutizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support hermeneutic readiness.'
            : 'Production hermeneutizability rollout requires PostgreSQL connectivity, hermeneutizability tables, idempotency key hermeneutizability, usage event hermeneutizability, and full signal coverage.',
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
        ? 'Production hermeneutizability rollout checks passed. Hermeneutizability coverage and hermeneutic readiness signal signals are healthy.'
        : 'Production hermeneutizability rollout is not ready. Resolve failed checks before relying on production hermeneutizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SUBSTANTIABILITY_TABLES = [
  'billing_records',
  'billing_webhook_events',
  'idempotency_keys',
] as const

export type SubstantiabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SubstantiabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SubstantiabilityRolloutCheck[]
  guidance: string
}

export type SubstantiabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSubstantiabilityTableCount: number
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  idempotencyKeysTableExists: boolean
}

export function evaluateSubstantiabilityRollout(
  input: SubstantiabilityRolloutInput,
): SubstantiabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const substantiabilityTableCoverageComplete =
    input.existingSubstantiabilityTableCount === CRITICAL_SUBSTANTIABILITY_TABLES.length

  const checks: SubstantiabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL substantiability checks can reach the database.'
            : 'Production substantiability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'substantiability_signal_table_coverage',
      label: 'Substantiability signal table coverage',
      status: substantiabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Substantiability signal table coverage is only enforced in production.'
          : substantiabilityTableCoverageComplete
            ? `${input.existingSubstantiabilityTableCount}/${CRITICAL_SUBSTANTIABILITY_TABLES.length} substantiability signal tables are present.`
            : `${input.existingSubstantiabilityTableCount}/${CRITICAL_SUBSTANTIABILITY_TABLES.length} substantiability signal tables were found.`,
    },
    {
      name: 'billing_record_substantiability',
      label: 'Billing record substantiability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record substantiability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record substantiability signals.'
            : 'Production substantiability rollout requires a billing_records table.',
    },
    {
      name: 'billing_webhook_substantiability',
      label: 'Billing webhook substantiability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook substantiability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook substantiability signals.'
            : 'Production substantiability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'substantiation_readiness_signal',
      label: 'Substantiation readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          substantiabilityTableCoverageComplete &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.idempotencyKeysTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Substantiation readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              substantiabilityTableCoverageComplete &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.idempotencyKeysTableExists
            ? 'Billing records, billing webhook events, and idempotency keys support substantiation readiness.'
            : 'Production substantiability rollout requires PostgreSQL connectivity, substantiability tables, billing record substantiability, billing webhook substantiability, and full signal coverage.',
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
        ? 'Production substantiability rollout checks passed. Substantiability coverage and substantiation readiness signal signals are healthy.'
        : 'Production substantiability rollout is not ready. Resolve failed checks before relying on production substantiability tooling.',
  }
}

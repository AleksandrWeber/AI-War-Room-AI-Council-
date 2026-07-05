import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ACCOUNTABILITY_TABLES = [
  'idempotency_keys',
  'billing_records',
  'usage_events',
] as const

export type AccountabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AccountabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AccountabilityRolloutCheck[]
  guidance: string
}

export type AccountabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAccountabilityTableCount: number
  idempotencyKeysTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateAccountabilityRollout(
  input: AccountabilityRolloutInput,
): AccountabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const accountabilityTableCoverageComplete =
    input.existingAccountabilityTableCount ===
    CRITICAL_ACCOUNTABILITY_TABLES.length

  const checks: AccountabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL accountability checks can reach the database.'
            : 'Production accountability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'accountability_signal_table_coverage',
      label: 'Accountability signal table coverage',
      status:
        accountabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Accountability signal table coverage is only enforced in production.'
          : accountabilityTableCoverageComplete
            ? `${input.existingAccountabilityTableCount}/${CRITICAL_ACCOUNTABILITY_TABLES.length} accountability signal tables are present.`
            : `${input.existingAccountabilityTableCount}/${CRITICAL_ACCOUNTABILITY_TABLES.length} accountability signal tables were found.`,
    },
    {
      name: 'idempotency_accountability',
      label: 'Idempotency accountability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency accountability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency accountability signals.'
            : 'Production accountability rollout requires an idempotency_keys table.',
    },
    {
      name: 'billing_record_accountability',
      label: 'Billing record accountability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record accountability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record accountability signals.'
            : 'Production accountability rollout requires a billing_records table.',
    },
    {
      name: 'audit_readiness_signal',
      label: 'Audit readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          accountabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Audit readiness is only enforced in production.'
          : input.postgresConnectivity &&
              accountabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Idempotency keys, billing records, and usage events support audit readiness.'
            : 'Production accountability rollout requires PostgreSQL connectivity, accountability tables, idempotency accountability, billing record accountability, and usage audit coverage.',
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
        ? 'Production accountability rollout checks passed. Accountability coverage and audit readiness signals are healthy.'
        : 'Production accountability rollout is not ready. Resolve failed checks before relying on production accountability tooling.',
  }
}

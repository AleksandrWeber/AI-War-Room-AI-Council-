import type { ApiEnv } from '../config/env.js'

export const CRITICAL_INTERCHANGEABILITY_TABLES = [
  'billing_meter_usage_reports',
  'idempotency_keys',
  'workspace_usage_limits',
] as const

export type InterchangeabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type InterchangeabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: InterchangeabilityRolloutCheck[]
  guidance: string
}

export type InterchangeabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingInterchangeabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  idempotencyKeysTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateInterchangeabilityRollout(
  input: InterchangeabilityRolloutInput,
): InterchangeabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const interchangeabilityTableCoverageComplete =
    input.existingInterchangeabilityTableCount === CRITICAL_INTERCHANGEABILITY_TABLES.length

  const checks: InterchangeabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL interchangeability checks can reach the database.'
            : 'Production interchangeability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'interchangeability_signal_table_coverage',
      label: 'Interchangeability signal table coverage',
      status: interchangeabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Interchangeability signal table coverage is only enforced in production.'
          : interchangeabilityTableCoverageComplete
            ? `${input.existingInterchangeabilityTableCount}/${CRITICAL_INTERCHANGEABILITY_TABLES.length} interchangeability signal tables are present.`
            : `${input.existingInterchangeabilityTableCount}/${CRITICAL_INTERCHANGEABILITY_TABLES.length} interchangeability signal tables were found.`,
    },
    {
      name: 'meter_usage_interchangeability',
      label: 'Meter usage interchangeability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage interchangeability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage interchangeability signals.'
            : 'Production interchangeability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'idempotency_key_interchangeability',
      label: 'Idempotency key interchangeability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key interchangeability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key interchangeability signals.'
            : 'Production interchangeability rollout requires a idempotency_keys table.',
    },
    {
      name: 'interchange_readiness_signal',
      label: 'Interchange readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          interchangeabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.idempotencyKeysTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Interchange readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              interchangeabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.idempotencyKeysTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Meter usage reports, idempotency keys, and workspace usage limits support interchange readiness.'
            : 'Production interchangeability rollout requires PostgreSQL connectivity, interchangeability tables, meter usage interchangeability, idempotency key interchangeability, and full signal coverage.',
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
        ? 'Production interchangeability rollout checks passed. Interchangeability coverage and interchange readiness signal signals are healthy.'
        : 'Production interchangeability rollout is not ready. Resolve failed checks before relying on production interchangeability tooling.',
  }
}

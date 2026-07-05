import type { ApiEnv } from '../config/env.js'

export const CRITICAL_MODIFIABILITY_TABLES = [
  'idempotency_keys',
  'billing_records',
  'workspace_memberships',
] as const

export type ModifiabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ModifiabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ModifiabilityRolloutCheck[]
  guidance: string
}

export type ModifiabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingModifiabilityTableCount: number
  idempotencyKeysTableExists: boolean
  billingRecordsTableExists: boolean
  workspaceMembershipsTableExists: boolean
}

export function evaluateModifiabilityRollout(
  input: ModifiabilityRolloutInput,
): ModifiabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const modifiabilityTableCoverageComplete =
    input.existingModifiabilityTableCount === CRITICAL_MODIFIABILITY_TABLES.length

  const checks: ModifiabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL modifiability checks can reach the database.'
            : 'Production modifiability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'modifiability_signal_table_coverage',
      label: 'Modifiability signal table coverage',
      status: modifiabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Modifiability signal table coverage is only enforced in production.'
          : modifiabilityTableCoverageComplete
            ? `${input.existingModifiabilityTableCount}/${CRITICAL_MODIFIABILITY_TABLES.length} modifiability signal tables are present.`
            : `${input.existingModifiabilityTableCount}/${CRITICAL_MODIFIABILITY_TABLES.length} modifiability signal tables were found.`,
    },
    {
      name: 'idempotency_key_modifiability',
      label: 'Idempotency key modifiability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key modifiability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key modifiability signals.'
            : 'Production modifiability rollout requires a idempotency_keys table.',
    },
    {
      name: 'billing_record_modifiability',
      label: 'Billing record modifiability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record modifiability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record modifiability signals.'
            : 'Production modifiability rollout requires a billing_records table.',
    },
    {
      name: 'modification_readiness_signal',
      label: 'Modification readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          modifiabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.billingRecordsTableExists &&
          input.workspaceMembershipsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Modification readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              modifiabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.billingRecordsTableExists &&
              input.workspaceMembershipsTableExists
            ? 'Idempotency keys, billing records, and workspace memberships support modification readiness.'
            : 'Production modifiability rollout requires PostgreSQL connectivity, modifiability tables, idempotency key modifiability, billing record modifiability, and full signal coverage.',
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
        ? 'Production modifiability rollout checks passed. Modifiability coverage and modification readiness signal signals are healthy.'
        : 'Production modifiability rollout is not ready. Resolve failed checks before relying on production modifiability tooling.',
  }
}

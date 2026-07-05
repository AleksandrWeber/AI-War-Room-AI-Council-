import type { ApiEnv } from '../config/env.js'

export const CRITICAL_MANAGEABILITY_TABLES = [
  'billing_notifications',
  'billing_records',
  'idempotency_keys',
] as const

export type ManageabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ManageabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ManageabilityRolloutCheck[]
  guidance: string
}

export type ManageabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingManageabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingRecordsTableExists: boolean
  idempotencyKeysTableExists: boolean
}

export function evaluateManageabilityRollout(
  input: ManageabilityRolloutInput,
): ManageabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const manageabilityTableCoverageComplete =
    input.existingManageabilityTableCount === CRITICAL_MANAGEABILITY_TABLES.length

  const checks: ManageabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL manageability checks can reach the database.'
            : 'Production manageability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'manageability_signal_table_coverage',
      label: 'Manageability signal table coverage',
      status: manageabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Manageability signal table coverage is only enforced in production.'
          : manageabilityTableCoverageComplete
            ? `${input.existingManageabilityTableCount}/${CRITICAL_MANAGEABILITY_TABLES.length} manageability signal tables are present.`
            : `${input.existingManageabilityTableCount}/${CRITICAL_MANAGEABILITY_TABLES.length} manageability signal tables were found.`,
    },
    {
      name: 'billing_notification_manageability',
      label: 'Billing notification manageability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification manageability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification manageability signals.'
            : 'Production manageability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_record_manageability',
      label: 'Billing record manageability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record manageability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record manageability signals.'
            : 'Production manageability rollout requires a billing_records table.',
    },
    {
      name: 'management_readiness_signal',
      label: 'Management readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          manageabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingRecordsTableExists &&
          input.idempotencyKeysTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Management readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              manageabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingRecordsTableExists &&
              input.idempotencyKeysTableExists
            ? 'Billing notifications, billing records, and idempotency keys support management readiness.'
            : 'Production manageability rollout requires PostgreSQL connectivity, manageability tables, billing notification manageability, billing record manageability, and full signal coverage.',
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
        ? 'Production manageability rollout checks passed. Manageability coverage and management readiness signal signals are healthy.'
        : 'Production manageability rollout is not ready. Resolve failed checks before relying on production manageability tooling.',
  }
}

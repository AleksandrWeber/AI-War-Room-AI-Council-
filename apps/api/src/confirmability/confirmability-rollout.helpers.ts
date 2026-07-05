import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CONFIRMABILITY_TABLES = [
  'billing_notifications',
  'workspace_usage_limits',
  'billing_meter_usage_reports',
] as const

export type ConfirmabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ConfirmabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ConfirmabilityRolloutCheck[]
  guidance: string
}

export type ConfirmabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingConfirmabilityTableCount: number
  billingNotificationsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
  billingMeterUsageReportsTableExists: boolean
}

export function evaluateConfirmabilityRollout(
  input: ConfirmabilityRolloutInput,
): ConfirmabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const confirmabilityTableCoverageComplete =
    input.existingConfirmabilityTableCount === CRITICAL_CONFIRMABILITY_TABLES.length

  const checks: ConfirmabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL confirmability checks can reach the database.'
            : 'Production confirmability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'confirmability_signal_table_coverage',
      label: 'Confirmability signal table coverage',
      status: confirmabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Confirmability signal table coverage is only enforced in production.'
          : confirmabilityTableCoverageComplete
            ? `${input.existingConfirmabilityTableCount}/${CRITICAL_CONFIRMABILITY_TABLES.length} confirmability signal tables are present.`
            : `${input.existingConfirmabilityTableCount}/${CRITICAL_CONFIRMABILITY_TABLES.length} confirmability signal tables were found.`,
    },
    {
      name: 'billing_notification_confirmability',
      label: 'Billing notification confirmability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification confirmability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification confirmability signals.'
            : 'Production confirmability rollout requires a billing_notifications table.',
    },
    {
      name: 'usage_limit_confirmability',
      label: 'Usage limit confirmability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage limit confirmability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for usage limit confirmability signals.'
            : 'Production confirmability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'acknowledgment_readiness_signal',
      label: 'Acknowledgment readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          confirmabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.workspaceUsageLimitsTableExists &&
          input.billingMeterUsageReportsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Acknowledgment readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              confirmabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.workspaceUsageLimitsTableExists &&
              input.billingMeterUsageReportsTableExists
            ? 'Billing notifications, workspace usage limits, and meter usage reports support acknowledgment readiness.'
            : 'Production confirmability rollout requires PostgreSQL connectivity, confirmability tables, billing notification confirmability, usage limit confirmability, and full signal coverage.',
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
        ? 'Production confirmability rollout checks passed. Confirmability coverage and acknowledgment readiness signal signals are healthy.'
        : 'Production confirmability rollout is not ready. Resolve failed checks before relying on production confirmability tooling.',
  }
}

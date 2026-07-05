import type { ApiEnv } from '../config/env.js'

export const CRITICAL_OPERABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'billing_records',
] as const

export type OperabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type OperabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: OperabilityRolloutCheck[]
  guidance: string
}

export type OperabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingOperabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateOperabilityRollout(
  input: OperabilityRolloutInput,
): OperabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const operabilityTableCoverageComplete =
    input.existingOperabilityTableCount === CRITICAL_OPERABILITY_TABLES.length

  const checks: OperabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL operability checks can reach the database.'
            : 'Production operability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'operability_signal_table_coverage',
      label: 'Operability signal table coverage',
      status: operabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Operability signal table coverage is only enforced in production.'
          : operabilityTableCoverageComplete
            ? `${input.existingOperabilityTableCount}/${CRITICAL_OPERABILITY_TABLES.length} operability signal tables are present.`
            : `${input.existingOperabilityTableCount}/${CRITICAL_OPERABILITY_TABLES.length} operability signal tables were found.`,
    },
    {
      name: 'billing_notification_operability',
      label: 'Billing notification operability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification operability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification operability signals.'
            : 'Production operability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_operability',
      label: 'Billing webhook operability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook operability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook operability signals.'
            : 'Production operability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'operation_readiness_signal',
      label: 'Operation readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          operabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Operation readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              operabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Billing notifications, billing webhook events, and billing records support operation readiness.'
            : 'Production operability rollout requires PostgreSQL connectivity, operability tables, billing notification operability, billing webhook operability, and full signal coverage.',
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
        ? 'Production operability rollout checks passed. Operability coverage and operation readiness signal signals are healthy.'
        : 'Production operability rollout is not ready. Resolve failed checks before relying on production operability tooling.',
  }
}

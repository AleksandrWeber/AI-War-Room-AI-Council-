import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DETECTABILITY_TABLES = [
  'billing_webhook_events',
  'billing_notifications',
  'idempotency_keys',
] as const

export type DetectabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DetectabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DetectabilityRolloutCheck[]
  guidance: string
}

export type DetectabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDetectabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingNotificationsTableExists: boolean
  idempotencyKeysTableExists: boolean
}

export function evaluateDetectabilityRollout(
  input: DetectabilityRolloutInput,
): DetectabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const detectabilityTableCoverageComplete =
    input.existingDetectabilityTableCount === CRITICAL_DETECTABILITY_TABLES.length

  const checks: DetectabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL detectability checks can reach the database.'
            : 'Production detectability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'detectability_signal_table_coverage',
      label: 'Detectability signal table coverage',
      status: detectabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Detectability signal table coverage is only enforced in production.'
          : detectabilityTableCoverageComplete
            ? `${input.existingDetectabilityTableCount}/${CRITICAL_DETECTABILITY_TABLES.length} detectability signal tables are present.`
            : `${input.existingDetectabilityTableCount}/${CRITICAL_DETECTABILITY_TABLES.length} detectability signal tables were found.`,
    },
    {
      name: 'billing_webhook_detectability',
      label: 'Billing webhook detectability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook detectability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook detectability signals.'
            : 'Production detectability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_notification_detectability',
      label: 'Billing notification detectability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification detectability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification detectability signals.'
            : 'Production detectability rollout requires a billing_notifications table.',
    },
    {
      name: 'detection_readiness_signal',
      label: 'Detection readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          detectabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingNotificationsTableExists &&
          input.idempotencyKeysTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Detection readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              detectabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingNotificationsTableExists &&
              input.idempotencyKeysTableExists
            ? 'Billing webhook events, billing notifications, and idempotency keys support detection readiness.'
            : 'Production detectability rollout requires PostgreSQL connectivity, detectability tables, billing webhook detectability, billing notification detectability, and full signal coverage.',
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
        ? 'Production detectability rollout checks passed. Detectability coverage and detection readiness signal signals are healthy.'
        : 'Production detectability rollout is not ready. Resolve failed checks before relying on production detectability tooling.',
  }
}

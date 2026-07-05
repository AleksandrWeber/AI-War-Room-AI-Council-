import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ADAPTABILITY_TABLES = [
  'billing_webhook_events',
  'billing_notifications',
  'idempotency_keys',
] as const

export type AdaptabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AdaptabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AdaptabilityRolloutCheck[]
  guidance: string
}

export type AdaptabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAdaptabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingNotificationsTableExists: boolean
  idempotencyKeysTableExists: boolean
}

export function evaluateAdaptabilityRollout(
  input: AdaptabilityRolloutInput,
): AdaptabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const adaptabilityTableCoverageComplete =
    input.existingAdaptabilityTableCount === CRITICAL_ADAPTABILITY_TABLES.length

  const checks: AdaptabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL adaptability checks can reach the database.'
            : 'Production adaptability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'adaptability_signal_table_coverage',
      label: 'Adaptability signal table coverage',
      status: adaptabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Adaptability signal table coverage is only enforced in production.'
          : adaptabilityTableCoverageComplete
            ? `${input.existingAdaptabilityTableCount}/${CRITICAL_ADAPTABILITY_TABLES.length} adaptability signal tables are present.`
            : `${input.existingAdaptabilityTableCount}/${CRITICAL_ADAPTABILITY_TABLES.length} adaptability signal tables were found.`,
    },
    {
      name: 'billing_webhook_adaptability',
      label: 'Billing webhook adaptability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook adaptability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook adaptability signals.'
            : 'Production adaptability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_notification_adaptability',
      label: 'Billing notification adaptability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification adaptability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification adaptability signals.'
            : 'Production adaptability rollout requires a billing_notifications table.',
    },
    {
      name: 'adaptation_readiness_signal',
      label: 'Adaptation readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          adaptabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingNotificationsTableExists &&
          input.idempotencyKeysTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Adaptation readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              adaptabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingNotificationsTableExists &&
              input.idempotencyKeysTableExists
            ? 'Billing webhook events, billing notifications, and idempotency keys support adaptation readiness.'
            : 'Production adaptability rollout requires PostgreSQL connectivity, adaptability tables, billing webhook adaptability, billing notification adaptability, and full signal coverage.',
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
        ? 'Production adaptability rollout checks passed. Adaptability coverage and adaptation readiness signal signals are healthy.'
        : 'Production adaptability rollout is not ready. Resolve failed checks before relying on production adaptability tooling.',
  }
}

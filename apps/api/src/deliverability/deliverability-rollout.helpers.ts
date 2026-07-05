import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DELIVERABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type DeliverabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DeliverabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DeliverabilityRolloutCheck[]
  guidance: string
}

export type DeliverabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDeliverabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateDeliverabilityRollout(
  input: DeliverabilityRolloutInput,
): DeliverabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const deliverabilityTableCoverageComplete =
    input.existingDeliverabilityTableCount === CRITICAL_DELIVERABILITY_TABLES.length

  const checks: DeliverabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL deliverability checks can reach the database.'
            : 'Production deliverability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'deliverability_signal_table_coverage',
      label: 'Deliverability signal table coverage',
      status: deliverabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Deliverability signal table coverage is only enforced in production.'
          : deliverabilityTableCoverageComplete
            ? `${input.existingDeliverabilityTableCount}/${CRITICAL_DELIVERABILITY_TABLES.length} deliverability signal tables are present.`
            : `${input.existingDeliverabilityTableCount}/${CRITICAL_DELIVERABILITY_TABLES.length} deliverability signal tables were found.`,
    },
    {
      name: 'billing_notification_deliverability',
      label: 'Billing notification deliverability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification deliverability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification deliverability signals.'
            : 'Production deliverability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_deliverability',
      label: 'Billing webhook deliverability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook deliverability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook deliverability signals.'
            : 'Production deliverability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'delivery_readiness_signal',
      label: 'Delivery readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          deliverabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Delivery readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              deliverabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support delivery readiness.'
            : 'Production deliverability rollout requires PostgreSQL connectivity, deliverability tables, billing notification deliverability, billing webhook deliverability, and full signal coverage.',
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
        ? 'Production deliverability rollout checks passed. Deliverability coverage and delivery readiness signal signals are healthy.'
        : 'Production deliverability rollout is not ready. Resolve failed checks before relying on production deliverability tooling.',
  }
}

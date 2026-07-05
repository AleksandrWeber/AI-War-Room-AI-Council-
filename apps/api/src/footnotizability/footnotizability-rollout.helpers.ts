import type { ApiEnv } from '../config/env.js'

export const CRITICAL_FOOTNOTIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type FootnotizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type FootnotizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: FootnotizabilityRolloutCheck[]
  guidance: string
}

export type FootnotizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingFootnotizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateFootnotizabilityRollout(
  input: FootnotizabilityRolloutInput,
): FootnotizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const footnotizabilityTableCoverageComplete =
    input.existingFootnotizabilityTableCount === CRITICAL_FOOTNOTIZABILITY_TABLES.length

  const checks: FootnotizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL footnotizability checks can reach the database.'
            : 'Production footnotizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'footnotizability_signal_table_coverage',
      label: 'Footnotizability signal table coverage',
      status: footnotizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Footnotizability signal table coverage is only enforced in production.'
          : footnotizabilityTableCoverageComplete
            ? `${input.existingFootnotizabilityTableCount}/${CRITICAL_FOOTNOTIZABILITY_TABLES.length} footnotizability signal tables are present.`
            : `${input.existingFootnotizabilityTableCount}/${CRITICAL_FOOTNOTIZABILITY_TABLES.length} footnotizability signal tables were found.`,
    },
    {
      name: 'billing_notification_footnotizability',
      label: 'Billing notification footnotizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification footnotizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification footnotizability signals.'
            : 'Production footnotizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_footnotizability',
      label: 'Billing webhook footnotizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook footnotizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook footnotizability signals.'
            : 'Production footnotizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'footnotization_readiness_signal',
      label: 'Footnotization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          footnotizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Footnotization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              footnotizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support footnotization readiness.'
            : 'Production footnotizability rollout requires PostgreSQL connectivity, footnotizability tables, billing notification footnotizability, billing webhook footnotizability, and full signal coverage.',
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
        ? 'Production footnotizability rollout checks passed. Footnotizability coverage and footnotization readiness signal signals are healthy.'
        : 'Production footnotizability rollout is not ready. Resolve failed checks before relying on production footnotizability tooling.',
  }
}

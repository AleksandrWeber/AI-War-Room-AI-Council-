import type { ApiEnv } from '../config/env.js'

export const CRITICAL_NOTIFIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type NotifizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type NotifizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: NotifizabilityRolloutCheck[]
  guidance: string
}

export type NotifizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingNotifizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateNotifizabilityRollout(
  input: NotifizabilityRolloutInput,
): NotifizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const notifizabilityTableCoverageComplete =
    input.existingNotifizabilityTableCount === CRITICAL_NOTIFIZABILITY_TABLES.length

  const checks: NotifizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL notifizability checks can reach the database.'
            : 'Production notifizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'notifizability_signal_table_coverage',
      label: 'Notifizability signal table coverage',
      status: notifizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Notifizability signal table coverage is only enforced in production.'
          : notifizabilityTableCoverageComplete
            ? `${input.existingNotifizabilityTableCount}/${CRITICAL_NOTIFIZABILITY_TABLES.length} notifizability signal tables are present.`
            : `${input.existingNotifizabilityTableCount}/${CRITICAL_NOTIFIZABILITY_TABLES.length} notifizability signal tables were found.`,
    },
    {
      name: 'billing_notification_notifizability',
      label: 'Billing notification notifizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification notifizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification notifizability signals.'
            : 'Production notifizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_notifizability',
      label: 'Billing webhook notifizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook notifizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook notifizability signals.'
            : 'Production notifizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'notifization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          notifizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              notifizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support notifization readiness.'
            : 'Production notifizability rollout requires PostgreSQL connectivity, notifizability tables, billing notification notifizability, billing webhook notifizability, and full signal coverage.',
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
        ? 'Production notifizability rollout checks passed. Notifizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production notifizability rollout is not ready. Resolve failed checks before relying on production notifizability tooling.',
  }
}

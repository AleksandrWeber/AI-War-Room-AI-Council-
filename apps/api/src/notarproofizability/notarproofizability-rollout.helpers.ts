import type { ApiEnv } from '../config/env.js'

export const CRITICAL_NOTARPROOFIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type NotarproofizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type NotarproofizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: NotarproofizabilityRolloutCheck[]
  guidance: string
}

export type NotarproofizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingNotarproofizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateNotarproofizabilityRollout(
  input: NotarproofizabilityRolloutInput,
): NotarproofizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const notarproofizabilityTableCoverageComplete =
    input.existingNotarproofizabilityTableCount === CRITICAL_NOTARPROOFIZABILITY_TABLES.length

  const checks: NotarproofizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL notarproofizability checks can reach the database.'
            : 'Production notarproofizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'notarproofizability_signal_table_coverage',
      label: 'Notarproofizability signal table coverage',
      status: notarproofizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Notarproofizability signal table coverage is only enforced in production.'
          : notarproofizabilityTableCoverageComplete
            ? `${input.existingNotarproofizabilityTableCount}/${CRITICAL_NOTARPROOFIZABILITY_TABLES.length} notarproofizability signal tables are present.`
            : `${input.existingNotarproofizabilityTableCount}/${CRITICAL_NOTARPROOFIZABILITY_TABLES.length} notarproofizability signal tables were found.`,
    },
    {
      name: 'billing_notification_notarproofizability',
      label: 'Billing notification notarproofizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification notarproofizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification notarproofizability signals.'
            : 'Production notarproofizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_notarproofizability',
      label: 'Billing webhook notarproofizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook notarproofizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook notarproofizability signals.'
            : 'Production notarproofizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          notarproofizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              notarproofizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production notarproofizability rollout requires PostgreSQL connectivity, notarproofizability tables, billing notification notarproofizability, billing webhook notarproofizability, and full signal coverage.',
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
        ? 'Production notarproofizability rollout checks passed. Notarproofizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production notarproofizability rollout is not ready. Resolve failed checks before relying on production notarproofizability tooling.',
  }
}

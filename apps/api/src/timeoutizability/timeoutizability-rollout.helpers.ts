import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TIMEOUTIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type TimeoutizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TimeoutizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TimeoutizabilityRolloutCheck[]
  guidance: string
}

export type TimeoutizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTimeoutizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateTimeoutizabilityRollout(
  input: TimeoutizabilityRolloutInput,
): TimeoutizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const timeoutizabilityTableCoverageComplete =
    input.existingTimeoutizabilityTableCount === CRITICAL_TIMEOUTIZABILITY_TABLES.length

  const checks: TimeoutizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL timeoutizability checks can reach the database.'
            : 'Production timeoutizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'timeoutizability_signal_table_coverage',
      label: 'Timeoutizability signal table coverage',
      status: timeoutizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Timeoutizability signal table coverage is only enforced in production.'
          : timeoutizabilityTableCoverageComplete
            ? `${input.existingTimeoutizabilityTableCount}/${CRITICAL_TIMEOUTIZABILITY_TABLES.length} timeoutizability signal tables are present.`
            : `${input.existingTimeoutizabilityTableCount}/${CRITICAL_TIMEOUTIZABILITY_TABLES.length} timeoutizability signal tables were found.`,
    },
    {
      name: 'billing_notification_timeoutizability',
      label: 'Billing notification timeoutizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification timeoutizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification timeoutizability signals.'
            : 'Production timeoutizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_timeoutizability',
      label: 'Billing webhook timeoutizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook timeoutizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook timeoutizability signals.'
            : 'Production timeoutizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'timeoutization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          timeoutizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              timeoutizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support timeoutization readiness.'
            : 'Production timeoutizability rollout requires PostgreSQL connectivity, timeoutizability tables, billing notification timeoutizability, billing webhook timeoutizability, and full signal coverage.',
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
        ? 'Production timeoutizability rollout checks passed. Timeoutizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production timeoutizability rollout is not ready. Resolve failed checks before relying on production timeoutizability tooling.',
  }
}

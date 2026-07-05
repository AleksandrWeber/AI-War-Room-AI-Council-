import type { ApiEnv } from '../config/env.js'

export const CRITICAL_WINDOWIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type WindowizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type WindowizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: WindowizabilityRolloutCheck[]
  guidance: string
}

export type WindowizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingWindowizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateWindowizabilityRollout(
  input: WindowizabilityRolloutInput,
): WindowizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const windowizabilityTableCoverageComplete =
    input.existingWindowizabilityTableCount === CRITICAL_WINDOWIZABILITY_TABLES.length

  const checks: WindowizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL windowizability checks can reach the database.'
            : 'Production windowizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'windowizability_signal_table_coverage',
      label: 'Windowizability signal table coverage',
      status: windowizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Windowizability signal table coverage is only enforced in production.'
          : windowizabilityTableCoverageComplete
            ? `${input.existingWindowizabilityTableCount}/${CRITICAL_WINDOWIZABILITY_TABLES.length} windowizability signal tables are present.`
            : `${input.existingWindowizabilityTableCount}/${CRITICAL_WINDOWIZABILITY_TABLES.length} windowizability signal tables were found.`,
    },
    {
      name: 'billing_notification_windowizability',
      label: 'Billing notification windowizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification windowizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification windowizability signals.'
            : 'Production windowizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_windowizability',
      label: 'Billing webhook windowizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook windowizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook windowizability signals.'
            : 'Production windowizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'windowization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          windowizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              windowizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support windowization readiness.'
            : 'Production windowizability rollout requires PostgreSQL connectivity, windowizability tables, billing notification windowizability, billing webhook windowizability, and full signal coverage.',
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
        ? 'Production windowizability rollout checks passed. Windowizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production windowizability rollout is not ready. Resolve failed checks before relying on production windowizability tooling.',
  }
}

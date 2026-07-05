import type { ApiEnv } from '../config/env.js'

export const CRITICAL_EXPIRATIONIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type ExpirationizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ExpirationizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ExpirationizabilityRolloutCheck[]
  guidance: string
}

export type ExpirationizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingExpirationizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateExpirationizabilityRollout(
  input: ExpirationizabilityRolloutInput,
): ExpirationizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const expirationizabilityTableCoverageComplete =
    input.existingExpirationizabilityTableCount === CRITICAL_EXPIRATIONIZABILITY_TABLES.length

  const checks: ExpirationizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL expirationizability checks can reach the database.'
            : 'Production expirationizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'expirationizability_signal_table_coverage',
      label: 'Expirationizability signal table coverage',
      status: expirationizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Expirationizability signal table coverage is only enforced in production.'
          : expirationizabilityTableCoverageComplete
            ? `${input.existingExpirationizabilityTableCount}/${CRITICAL_EXPIRATIONIZABILITY_TABLES.length} expirationizability signal tables are present.`
            : `${input.existingExpirationizabilityTableCount}/${CRITICAL_EXPIRATIONIZABILITY_TABLES.length} expirationizability signal tables were found.`,
    },
    {
      name: 'billing_notification_expirationizability',
      label: 'Billing notification expirationizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification expirationizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification expirationizability signals.'
            : 'Production expirationizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_expirationizability',
      label: 'Billing webhook expirationizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook expirationizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook expirationizability signals.'
            : 'Production expirationizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'expirationization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          expirationizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              expirationizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support expirationization readiness.'
            : 'Production expirationizability rollout requires PostgreSQL connectivity, expirationizability tables, billing notification expirationizability, billing webhook expirationizability, and full signal coverage.',
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
        ? 'Production expirationizability rollout checks passed. Expirationizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production expirationizability rollout is not ready. Resolve failed checks before relying on production expirationizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TOLERIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type TolerizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TolerizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TolerizabilityRolloutCheck[]
  guidance: string
}

export type TolerizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTolerizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateTolerizabilityRollout(
  input: TolerizabilityRolloutInput,
): TolerizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const tolerizabilityTableCoverageComplete =
    input.existingTolerizabilityTableCount === CRITICAL_TOLERIZABILITY_TABLES.length

  const checks: TolerizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL tolerizability checks can reach the database.'
            : 'Production tolerizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'tolerizability_signal_table_coverage',
      label: 'Tolerizability signal table coverage',
      status: tolerizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Tolerizability signal table coverage is only enforced in production.'
          : tolerizabilityTableCoverageComplete
            ? `${input.existingTolerizabilityTableCount}/${CRITICAL_TOLERIZABILITY_TABLES.length} tolerizability signal tables are present.`
            : `${input.existingTolerizabilityTableCount}/${CRITICAL_TOLERIZABILITY_TABLES.length} tolerizability signal tables were found.`,
    },
    {
      name: 'billing_notification_tolerizability',
      label: 'Billing notification tolerizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification tolerizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification tolerizability signals.'
            : 'Production tolerizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_tolerizability',
      label: 'Billing webhook tolerizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook tolerizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook tolerizability signals.'
            : 'Production tolerizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'tolerization_readiness_signal',
      label: 'Tolerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          tolerizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Tolerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              tolerizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support tolerization readiness.'
            : 'Production tolerizability rollout requires PostgreSQL connectivity, tolerizability tables, billing notification tolerizability, billing webhook tolerizability, and full signal coverage.',
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
        ? 'Production tolerizability rollout checks passed. Tolerizability coverage and tolerization readiness signal signals are healthy.'
        : 'Production tolerizability rollout is not ready. Resolve failed checks before relying on production tolerizability tooling.',
  }
}

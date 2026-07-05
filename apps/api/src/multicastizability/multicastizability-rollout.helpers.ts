import type { ApiEnv } from '../config/env.js'

export const CRITICAL_MULTICASTIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type MulticastizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type MulticastizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: MulticastizabilityRolloutCheck[]
  guidance: string
}

export type MulticastizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingMulticastizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateMulticastizabilityRollout(
  input: MulticastizabilityRolloutInput,
): MulticastizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const multicastizabilityTableCoverageComplete =
    input.existingMulticastizabilityTableCount === CRITICAL_MULTICASTIZABILITY_TABLES.length

  const checks: MulticastizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL multicastizability checks can reach the database.'
            : 'Production multicastizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'multicastizability_signal_table_coverage',
      label: 'Multicastizability signal table coverage',
      status: multicastizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Multicastizability signal table coverage is only enforced in production.'
          : multicastizabilityTableCoverageComplete
            ? `${input.existingMulticastizabilityTableCount}/${CRITICAL_MULTICASTIZABILITY_TABLES.length} multicastizability signal tables are present.`
            : `${input.existingMulticastizabilityTableCount}/${CRITICAL_MULTICASTIZABILITY_TABLES.length} multicastizability signal tables were found.`,
    },
    {
      name: 'billing_notification_multicastizability',
      label: 'Billing notification multicastizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification multicastizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification multicastizability signals.'
            : 'Production multicastizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_multicastizability',
      label: 'Billing webhook multicastizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook multicastizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook multicastizability signals.'
            : 'Production multicastizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'multicastization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          multicastizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              multicastizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support multicastization readiness.'
            : 'Production multicastizability rollout requires PostgreSQL connectivity, multicastizability tables, billing notification multicastizability, billing webhook multicastizability, and full signal coverage.',
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
        ? 'Production multicastizability rollout checks passed. Multicastizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production multicastizability rollout is not ready. Resolve failed checks before relying on production multicastizability tooling.',
  }
}

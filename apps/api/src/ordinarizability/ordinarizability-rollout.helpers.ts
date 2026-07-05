import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ORDINARIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type OrdinarizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type OrdinarizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: OrdinarizabilityRolloutCheck[]
  guidance: string
}

export type OrdinarizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingOrdinarizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateOrdinarizabilityRollout(
  input: OrdinarizabilityRolloutInput,
): OrdinarizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const ordinarizabilityTableCoverageComplete =
    input.existingOrdinarizabilityTableCount === CRITICAL_ORDINARIZABILITY_TABLES.length

  const checks: OrdinarizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL ordinarizability checks can reach the database.'
            : 'Production ordinarizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'ordinarizability_signal_table_coverage',
      label: 'Ordinarizability signal table coverage',
      status: ordinarizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Ordinarizability signal table coverage is only enforced in production.'
          : ordinarizabilityTableCoverageComplete
            ? `${input.existingOrdinarizabilityTableCount}/${CRITICAL_ORDINARIZABILITY_TABLES.length} ordinarizability signal tables are present.`
            : `${input.existingOrdinarizabilityTableCount}/${CRITICAL_ORDINARIZABILITY_TABLES.length} ordinarizability signal tables were found.`,
    },
    {
      name: 'billing_notification_ordinarizability',
      label: 'Billing notification ordinarizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification ordinarizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification ordinarizability signals.'
            : 'Production ordinarizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_ordinarizability',
      label: 'Billing webhook ordinarizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook ordinarizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook ordinarizability signals.'
            : 'Production ordinarizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'ordinarization_readiness_signal',
      label: 'Ordinarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          ordinarizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Ordinarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              ordinarizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support ordinarization readiness.'
            : 'Production ordinarizability rollout requires PostgreSQL connectivity, ordinarizability tables, billing notification ordinarizability, billing webhook ordinarizability, and full signal coverage.',
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
        ? 'Production ordinarizability rollout checks passed. Ordinarizability coverage and ordinarization readiness signal signals are healthy.'
        : 'Production ordinarizability rollout is not ready. Resolve failed checks before relying on production ordinarizability tooling.',
  }
}

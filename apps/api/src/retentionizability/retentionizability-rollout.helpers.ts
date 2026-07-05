import type { ApiEnv } from '../config/env.js'

export const CRITICAL_RETENTIONIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type RetentionizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RetentionizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RetentionizabilityRolloutCheck[]
  guidance: string
}

export type RetentionizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRetentionizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateRetentionizabilityRollout(
  input: RetentionizabilityRolloutInput,
): RetentionizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const retentionizabilityTableCoverageComplete =
    input.existingRetentionizabilityTableCount === CRITICAL_RETENTIONIZABILITY_TABLES.length

  const checks: RetentionizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL retentionizability checks can reach the database.'
            : 'Production retentionizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'retentionizability_signal_table_coverage',
      label: 'Retentionizability signal table coverage',
      status: retentionizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Retentionizability signal table coverage is only enforced in production.'
          : retentionizabilityTableCoverageComplete
            ? `${input.existingRetentionizabilityTableCount}/${CRITICAL_RETENTIONIZABILITY_TABLES.length} retentionizability signal tables are present.`
            : `${input.existingRetentionizabilityTableCount}/${CRITICAL_RETENTIONIZABILITY_TABLES.length} retentionizability signal tables were found.`,
    },
    {
      name: 'billing_notification_retentionizability',
      label: 'Billing notification retentionizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification retentionizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification retentionizability signals.'
            : 'Production retentionizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_retentionizability',
      label: 'Billing webhook retentionizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook retentionizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook retentionizability signals.'
            : 'Production retentionizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'retentionization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          retentionizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              retentionizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support retentionization readiness.'
            : 'Production retentionizability rollout requires PostgreSQL connectivity, retentionizability tables, billing notification retentionizability, billing webhook retentionizability, and full signal coverage.',
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
        ? 'Production retentionizability rollout checks passed. Retentionizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production retentionizability rollout is not ready. Resolve failed checks before relying on production retentionizability tooling.',
  }
}

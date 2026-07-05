import type { ApiEnv } from '../config/env.js'

export const CRITICAL_EMBLEMIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type EmblemizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type EmblemizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: EmblemizabilityRolloutCheck[]
  guidance: string
}

export type EmblemizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingEmblemizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateEmblemizabilityRollout(
  input: EmblemizabilityRolloutInput,
): EmblemizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const emblemizabilityTableCoverageComplete =
    input.existingEmblemizabilityTableCount === CRITICAL_EMBLEMIZABILITY_TABLES.length

  const checks: EmblemizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL emblemizability checks can reach the database.'
            : 'Production emblemizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'emblemizability_signal_table_coverage',
      label: 'Emblemizability signal table coverage',
      status: emblemizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Emblemizability signal table coverage is only enforced in production.'
          : emblemizabilityTableCoverageComplete
            ? `${input.existingEmblemizabilityTableCount}/${CRITICAL_EMBLEMIZABILITY_TABLES.length} emblemizability signal tables are present.`
            : `${input.existingEmblemizabilityTableCount}/${CRITICAL_EMBLEMIZABILITY_TABLES.length} emblemizability signal tables were found.`,
    },
    {
      name: 'billing_notification_emblemizability',
      label: 'Billing notification emblemizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification emblemizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification emblemizability signals.'
            : 'Production emblemizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_emblemizability',
      label: 'Billing webhook emblemizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook emblemizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook emblemizability signals.'
            : 'Production emblemizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'emblemization_readiness_signal',
      label: 'Emblemization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          emblemizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Emblemization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              emblemizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support emblemization readiness.'
            : 'Production emblemizability rollout requires PostgreSQL connectivity, emblemizability tables, billing notification emblemizability, billing webhook emblemizability, and full signal coverage.',
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
        ? 'Production emblemizability rollout checks passed. Emblemizability coverage and emblemization readiness signal signals are healthy.'
        : 'Production emblemizability rollout is not ready. Resolve failed checks before relying on production emblemizability tooling.',
  }
}

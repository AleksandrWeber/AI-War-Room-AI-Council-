import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ENUNCIABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type EnunciabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type EnunciabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: EnunciabilityRolloutCheck[]
  guidance: string
}

export type EnunciabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingEnunciabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateEnunciabilityRollout(
  input: EnunciabilityRolloutInput,
): EnunciabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const enunciabilityTableCoverageComplete =
    input.existingEnunciabilityTableCount === CRITICAL_ENUNCIABILITY_TABLES.length

  const checks: EnunciabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL enunciability checks can reach the database.'
            : 'Production enunciability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'enunciability_signal_table_coverage',
      label: 'Enunciability signal table coverage',
      status: enunciabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Enunciability signal table coverage is only enforced in production.'
          : enunciabilityTableCoverageComplete
            ? `${input.existingEnunciabilityTableCount}/${CRITICAL_ENUNCIABILITY_TABLES.length} enunciability signal tables are present.`
            : `${input.existingEnunciabilityTableCount}/${CRITICAL_ENUNCIABILITY_TABLES.length} enunciability signal tables were found.`,
    },
    {
      name: 'billing_notification_enunciability',
      label: 'Billing notification enunciability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification enunciability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification enunciability signals.'
            : 'Production enunciability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_enunciability',
      label: 'Billing webhook enunciability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook enunciability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook enunciability signals.'
            : 'Production enunciability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'enunciation_readiness_signal',
      label: 'Enunciation readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          enunciabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Enunciation readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              enunciabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support enunciation readiness.'
            : 'Production enunciability rollout requires PostgreSQL connectivity, enunciability tables, billing notification enunciability, billing webhook enunciability, and full signal coverage.',
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
        ? 'Production enunciability rollout checks passed. Enunciability coverage and enunciation readiness signal signals are healthy.'
        : 'Production enunciability rollout is not ready. Resolve failed checks before relying on production enunciability tooling.',
  }
}

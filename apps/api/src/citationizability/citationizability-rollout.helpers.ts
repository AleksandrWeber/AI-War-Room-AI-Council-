import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CITATIONIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type CitationizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CitationizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CitationizabilityRolloutCheck[]
  guidance: string
}

export type CitationizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCitationizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateCitationizabilityRollout(
  input: CitationizabilityRolloutInput,
): CitationizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const citationizabilityTableCoverageComplete =
    input.existingCitationizabilityTableCount === CRITICAL_CITATIONIZABILITY_TABLES.length

  const checks: CitationizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL citationizability checks can reach the database.'
            : 'Production citationizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'citationizability_signal_table_coverage',
      label: 'Citationizability signal table coverage',
      status: citationizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Citationizability signal table coverage is only enforced in production.'
          : citationizabilityTableCoverageComplete
            ? `${input.existingCitationizabilityTableCount}/${CRITICAL_CITATIONIZABILITY_TABLES.length} citationizability signal tables are present.`
            : `${input.existingCitationizabilityTableCount}/${CRITICAL_CITATIONIZABILITY_TABLES.length} citationizability signal tables were found.`,
    },
    {
      name: 'billing_notification_citationizability',
      label: 'Billing notification citationizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification citationizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification citationizability signals.'
            : 'Production citationizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_citationizability',
      label: 'Billing webhook citationizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook citationizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook citationizability signals.'
            : 'Production citationizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'citationization_readiness_signal',
      label: 'Citationization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          citationizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Citationization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              citationizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support citationization readiness.'
            : 'Production citationizability rollout requires PostgreSQL connectivity, citationizability tables, billing notification citationizability, billing webhook citationizability, and full signal coverage.',
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
        ? 'Production citationizability rollout checks passed. Citationizability coverage and citationization readiness signal signals are healthy.'
        : 'Production citationizability rollout is not ready. Resolve failed checks before relying on production citationizability tooling.',
  }
}

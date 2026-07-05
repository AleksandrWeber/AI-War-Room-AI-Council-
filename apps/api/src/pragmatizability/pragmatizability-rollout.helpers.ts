import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PRAGMATIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type PragmatizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type PragmatizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: PragmatizabilityRolloutCheck[]
  guidance: string
}

export type PragmatizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingPragmatizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluatePragmatizabilityRollout(
  input: PragmatizabilityRolloutInput,
): PragmatizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const pragmatizabilityTableCoverageComplete =
    input.existingPragmatizabilityTableCount === CRITICAL_PRAGMATIZABILITY_TABLES.length

  const checks: PragmatizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL pragmatizability checks can reach the database.'
            : 'Production pragmatizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'pragmatizability_signal_table_coverage',
      label: 'Pragmatizability signal table coverage',
      status: pragmatizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Pragmatizability signal table coverage is only enforced in production.'
          : pragmatizabilityTableCoverageComplete
            ? `${input.existingPragmatizabilityTableCount}/${CRITICAL_PRAGMATIZABILITY_TABLES.length} pragmatizability signal tables are present.`
            : `${input.existingPragmatizabilityTableCount}/${CRITICAL_PRAGMATIZABILITY_TABLES.length} pragmatizability signal tables were found.`,
    },
    {
      name: 'billing_notification_pragmatizability',
      label: 'Billing notification pragmatizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification pragmatizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification pragmatizability signals.'
            : 'Production pragmatizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_pragmatizability',
      label: 'Billing webhook pragmatizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook pragmatizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook pragmatizability signals.'
            : 'Production pragmatizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'pragmatic_readiness_signal',
      label: 'Pragmatic readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          pragmatizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Pragmatic readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              pragmatizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support pragmatic readiness.'
            : 'Production pragmatizability rollout requires PostgreSQL connectivity, pragmatizability tables, billing notification pragmatizability, billing webhook pragmatizability, and full signal coverage.',
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
        ? 'Production pragmatizability rollout checks passed. Pragmatizability coverage and pragmatic readiness signal signals are healthy.'
        : 'Production pragmatizability rollout is not ready. Resolve failed checks before relying on production pragmatizability tooling.',
  }
}

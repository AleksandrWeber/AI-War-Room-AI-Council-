import type { ApiEnv } from '../config/env.js'

export const CRITICAL_FALSIFIIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type FalsifiizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type FalsifiizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: FalsifiizabilityRolloutCheck[]
  guidance: string
}

export type FalsifiizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingFalsifiizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateFalsifiizabilityRollout(
  input: FalsifiizabilityRolloutInput,
): FalsifiizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const falsifiizabilityTableCoverageComplete =
    input.existingFalsifiizabilityTableCount === CRITICAL_FALSIFIIZABILITY_TABLES.length

  const checks: FalsifiizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL falsifiizability checks can reach the database.'
            : 'Production falsifiizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'falsifiizability_signal_table_coverage',
      label: 'Falsifiizability signal table coverage',
      status: falsifiizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Falsifiizability signal table coverage is only enforced in production.'
          : falsifiizabilityTableCoverageComplete
            ? `${input.existingFalsifiizabilityTableCount}/${CRITICAL_FALSIFIIZABILITY_TABLES.length} falsifiizability signal tables are present.`
            : `${input.existingFalsifiizabilityTableCount}/${CRITICAL_FALSIFIIZABILITY_TABLES.length} falsifiizability signal tables were found.`,
    },
    {
      name: 'billing_notification_falsifiizability',
      label: 'Billing notification falsifiizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification falsifiizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification falsifiizability signals.'
            : 'Production falsifiizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_falsifiizability',
      label: 'Billing webhook falsifiizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook falsifiizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook falsifiizability signals.'
            : 'Production falsifiizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'falsifiization_readiness_signal',
      label: 'Falsifiization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          falsifiizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Falsifiization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              falsifiizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support falsifiization readiness.'
            : 'Production falsifiizability rollout requires PostgreSQL connectivity, falsifiizability tables, billing notification falsifiizability, billing webhook falsifiizability, and full signal coverage.',
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
        ? 'Production falsifiizability rollout checks passed. Falsifiizability coverage and falsifiization readiness signal signals are healthy.'
        : 'Production falsifiizability rollout is not ready. Resolve failed checks before relying on production falsifiizability tooling.',
  }
}

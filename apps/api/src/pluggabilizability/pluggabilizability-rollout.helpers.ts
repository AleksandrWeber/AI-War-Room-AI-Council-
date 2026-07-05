import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PLUGGABILIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type PluggabilizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type PluggabilizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: PluggabilizabilityRolloutCheck[]
  guidance: string
}

export type PluggabilizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingPluggabilizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluatePluggabilizabilityRollout(
  input: PluggabilizabilityRolloutInput,
): PluggabilizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const pluggabilizabilityTableCoverageComplete =
    input.existingPluggabilizabilityTableCount === CRITICAL_PLUGGABILIZABILITY_TABLES.length

  const checks: PluggabilizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL pluggabilizability checks can reach the database.'
            : 'Production pluggabilizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'pluggabilizability_signal_table_coverage',
      label: 'Pluggabilizability signal table coverage',
      status: pluggabilizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Pluggabilizability signal table coverage is only enforced in production.'
          : pluggabilizabilityTableCoverageComplete
            ? `${input.existingPluggabilizabilityTableCount}/${CRITICAL_PLUGGABILIZABILITY_TABLES.length} pluggabilizability signal tables are present.`
            : `${input.existingPluggabilizabilityTableCount}/${CRITICAL_PLUGGABILIZABILITY_TABLES.length} pluggabilizability signal tables were found.`,
    },
    {
      name: 'billing_notification_pluggabilizability',
      label: 'Billing notification pluggabilizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification pluggabilizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification pluggabilizability signals.'
            : 'Production pluggabilizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_pluggabilizability',
      label: 'Billing webhook pluggabilizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook pluggabilizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook pluggabilizability signals.'
            : 'Production pluggabilizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'pluggabilization_readiness_signal',
      label: 'Pluggabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          pluggabilizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Pluggabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              pluggabilizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support pluggabilization readiness.'
            : 'Production pluggabilizability rollout requires PostgreSQL connectivity, pluggabilizability tables, billing notification pluggabilizability, billing webhook pluggabilizability, and full signal coverage.',
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
        ? 'Production pluggabilizability rollout checks passed. Pluggabilizability coverage and pluggabilization readiness signal signals are healthy.'
        : 'Production pluggabilizability rollout is not ready. Resolve failed checks before relying on production pluggabilizability tooling.',
  }
}

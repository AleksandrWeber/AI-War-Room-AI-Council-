import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DEDUCIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type DeducizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DeducizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DeducizabilityRolloutCheck[]
  guidance: string
}

export type DeducizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDeducizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateDeducizabilityRollout(
  input: DeducizabilityRolloutInput,
): DeducizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const deducizabilityTableCoverageComplete =
    input.existingDeducizabilityTableCount === CRITICAL_DEDUCIZABILITY_TABLES.length

  const checks: DeducizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL deducizability checks can reach the database.'
            : 'Production deducizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'deducizability_signal_table_coverage',
      label: 'Deducizability signal table coverage',
      status: deducizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Deducizability signal table coverage is only enforced in production.'
          : deducizabilityTableCoverageComplete
            ? `${input.existingDeducizabilityTableCount}/${CRITICAL_DEDUCIZABILITY_TABLES.length} deducizability signal tables are present.`
            : `${input.existingDeducizabilityTableCount}/${CRITICAL_DEDUCIZABILITY_TABLES.length} deducizability signal tables were found.`,
    },
    {
      name: 'billing_notification_deducizability',
      label: 'Billing notification deducizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification deducizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification deducizability signals.'
            : 'Production deducizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_deducizability',
      label: 'Billing webhook deducizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook deducizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook deducizability signals.'
            : 'Production deducizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'deducization_readiness_signal',
      label: 'Deducization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          deducizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Deducization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              deducizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support deducization readiness.'
            : 'Production deducizability rollout requires PostgreSQL connectivity, deducizability tables, billing notification deducizability, billing webhook deducizability, and full signal coverage.',
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
        ? 'Production deducizability rollout checks passed. Deducizability coverage and deducization readiness signal signals are healthy.'
        : 'Production deducizability rollout is not ready. Resolve failed checks before relying on production deducizability tooling.',
  }
}

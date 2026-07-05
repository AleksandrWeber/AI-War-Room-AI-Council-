import type { ApiEnv } from '../config/env.js'

export const CRITICAL_WALIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type WalizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type WalizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: WalizabilityRolloutCheck[]
  guidance: string
}

export type WalizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingWalizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateWalizabilityRollout(
  input: WalizabilityRolloutInput,
): WalizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const walizabilityTableCoverageComplete =
    input.existingWalizabilityTableCount === CRITICAL_WALIZABILITY_TABLES.length

  const checks: WalizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL walizability checks can reach the database.'
            : 'Production walizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'walizability_signal_table_coverage',
      label: 'Walizability signal table coverage',
      status: walizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Walizability signal table coverage is only enforced in production.'
          : walizabilityTableCoverageComplete
            ? `${input.existingWalizabilityTableCount}/${CRITICAL_WALIZABILITY_TABLES.length} walizability signal tables are present.`
            : `${input.existingWalizabilityTableCount}/${CRITICAL_WALIZABILITY_TABLES.length} walizability signal tables were found.`,
    },
    {
      name: 'billing_notification_walizability',
      label: 'Billing notification walizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification walizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification walizability signals.'
            : 'Production walizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_walizability',
      label: 'Billing webhook walizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook walizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook walizability signals.'
            : 'Production walizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'walization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          walizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              walizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support walization readiness.'
            : 'Production walizability rollout requires PostgreSQL connectivity, walizability tables, billing notification walizability, billing webhook walizability, and full signal coverage.',
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
        ? 'Production walizability rollout checks passed. Walizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production walizability rollout is not ready. Resolve failed checks before relying on production walizability tooling.',
  }
}

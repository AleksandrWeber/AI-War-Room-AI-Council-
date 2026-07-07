import type { ApiEnv } from '../config/env.js'

export const CRITICAL_INTEGRITYJOURNALIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type IntegrityjournalizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type IntegrityjournalizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: IntegrityjournalizabilityRolloutCheck[]
  guidance: string
}

export type IntegrityjournalizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingIntegrityjournalizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateIntegrityjournalizabilityRollout(
  input: IntegrityjournalizabilityRolloutInput,
): IntegrityjournalizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const integrityjournalizabilityTableCoverageComplete =
    input.existingIntegrityjournalizabilityTableCount === CRITICAL_INTEGRITYJOURNALIZABILITY_TABLES.length

  const checks: IntegrityjournalizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL integrityjournalizability checks can reach the database.'
            : 'Production integrityjournalizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'integrityjournalizability_signal_table_coverage',
      label: 'Integrityjournalizability signal table coverage',
      status: integrityjournalizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Integrityjournalizability signal table coverage is only enforced in production.'
          : integrityjournalizabilityTableCoverageComplete
            ? `${input.existingIntegrityjournalizabilityTableCount}/${CRITICAL_INTEGRITYJOURNALIZABILITY_TABLES.length} integrityjournalizability signal tables are present.`
            : `${input.existingIntegrityjournalizabilityTableCount}/${CRITICAL_INTEGRITYJOURNALIZABILITY_TABLES.length} integrityjournalizability signal tables were found.`,
    },
    {
      name: 'billing_notification_integrityjournalizability',
      label: 'Billing notification integrityjournalizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification integrityjournalizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification integrityjournalizability signals.'
            : 'Production integrityjournalizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_integrityjournalizability',
      label: 'Billing webhook integrityjournalizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook integrityjournalizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook integrityjournalizability signals.'
            : 'Production integrityjournalizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          integrityjournalizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              integrityjournalizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production integrityjournalizability rollout requires PostgreSQL connectivity, integrityjournalizability tables, billing notification integrityjournalizability, billing webhook integrityjournalizability, and full signal coverage.',
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
        ? 'Production integrityjournalizability rollout checks passed. Integrityjournalizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production integrityjournalizability rollout is not ready. Resolve failed checks before relying on production integrityjournalizability tooling.',
  }
}

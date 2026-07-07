import type { ApiEnv } from '../config/env.js'

export const CRITICAL_NAVIGABILITYVAULTIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type NavigabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type NavigabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: NavigabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type NavigabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingNavigabilityvaultizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateNavigabilityvaultizabilityRollout(
  input: NavigabilityvaultizabilityRolloutInput,
): NavigabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const navigabilityvaultizabilityTableCoverageComplete =
    input.existingNavigabilityvaultizabilityTableCount === CRITICAL_NAVIGABILITYVAULTIZABILITY_TABLES.length

  const checks: NavigabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL navigabilityvaultizability checks can reach the database.'
            : 'Production navigabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'navigabilityvaultizability_signal_table_coverage',
      label: 'Navigabilityvaultizability signal table coverage',
      status: navigabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Navigabilityvaultizability signal table coverage is only enforced in production.'
          : navigabilityvaultizabilityTableCoverageComplete
            ? `${input.existingNavigabilityvaultizabilityTableCount}/${CRITICAL_NAVIGABILITYVAULTIZABILITY_TABLES.length} navigabilityvaultizability signal tables are present.`
            : `${input.existingNavigabilityvaultizabilityTableCount}/${CRITICAL_NAVIGABILITYVAULTIZABILITY_TABLES.length} navigabilityvaultizability signal tables were found.`,
    },
    {
      name: 'billing_notification_navigabilityvaultizability',
      label: 'Billing notification navigabilityvaultizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification navigabilityvaultizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification navigabilityvaultizability signals.'
            : 'Production navigabilityvaultizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_navigabilityvaultizability',
      label: 'Billing webhook navigabilityvaultizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook navigabilityvaultizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook navigabilityvaultizability signals.'
            : 'Production navigabilityvaultizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          navigabilityvaultizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              navigabilityvaultizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production navigabilityvaultizability rollout requires PostgreSQL connectivity, navigabilityvaultizability tables, billing notification navigabilityvaultizability, billing webhook navigabilityvaultizability, and full signal coverage.',
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
        ? 'Production navigabilityvaultizability rollout checks passed. Navigabilityvaultizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production navigabilityvaultizability rollout is not ready. Resolve failed checks before relying on production navigabilityvaultizability tooling.',
  }
}

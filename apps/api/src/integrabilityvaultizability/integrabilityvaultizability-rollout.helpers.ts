import type { ApiEnv } from '../config/env.js'

export const CRITICAL_INTEGRABILITYVAULTIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type IntegrabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type IntegrabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: IntegrabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type IntegrabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingIntegrabilityvaultizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateIntegrabilityvaultizabilityRollout(
  input: IntegrabilityvaultizabilityRolloutInput,
): IntegrabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const integrabilityvaultizabilityTableCoverageComplete =
    input.existingIntegrabilityvaultizabilityTableCount === CRITICAL_INTEGRABILITYVAULTIZABILITY_TABLES.length

  const checks: IntegrabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL integrabilityvaultizability checks can reach the database.'
            : 'Production integrabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'integrabilityvaultizability_signal_table_coverage',
      label: 'Integrabilityvaultizability signal table coverage',
      status: integrabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Integrabilityvaultizability signal table coverage is only enforced in production.'
          : integrabilityvaultizabilityTableCoverageComplete
            ? `${input.existingIntegrabilityvaultizabilityTableCount}/${CRITICAL_INTEGRABILITYVAULTIZABILITY_TABLES.length} integrabilityvaultizability signal tables are present.`
            : `${input.existingIntegrabilityvaultizabilityTableCount}/${CRITICAL_INTEGRABILITYVAULTIZABILITY_TABLES.length} integrabilityvaultizability signal tables were found.`,
    },
    {
      name: 'billing_notification_integrabilityvaultizability',
      label: 'Billing notification integrabilityvaultizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification integrabilityvaultizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification integrabilityvaultizability signals.'
            : 'Production integrabilityvaultizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_integrabilityvaultizability',
      label: 'Billing webhook integrabilityvaultizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook integrabilityvaultizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook integrabilityvaultizability signals.'
            : 'Production integrabilityvaultizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          integrabilityvaultizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              integrabilityvaultizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production integrabilityvaultizability rollout requires PostgreSQL connectivity, integrabilityvaultizability tables, billing notification integrabilityvaultizability, billing webhook integrabilityvaultizability, and full signal coverage.',
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
        ? 'Production integrabilityvaultizability rollout checks passed. Integrabilityvaultizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production integrabilityvaultizability rollout is not ready. Resolve failed checks before relying on production integrabilityvaultizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PORTABILITYVAULTIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type PortabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type PortabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: PortabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type PortabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingPortabilityvaultizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluatePortabilityvaultizabilityRollout(
  input: PortabilityvaultizabilityRolloutInput,
): PortabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const portabilityvaultizabilityTableCoverageComplete =
    input.existingPortabilityvaultizabilityTableCount === CRITICAL_PORTABILITYVAULTIZABILITY_TABLES.length

  const checks: PortabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL portabilityvaultizability checks can reach the database.'
            : 'Production portabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'portabilityvaultizability_signal_table_coverage',
      label: 'Portabilityvaultizability signal table coverage',
      status: portabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Portabilityvaultizability signal table coverage is only enforced in production.'
          : portabilityvaultizabilityTableCoverageComplete
            ? `${input.existingPortabilityvaultizabilityTableCount}/${CRITICAL_PORTABILITYVAULTIZABILITY_TABLES.length} portabilityvaultizability signal tables are present.`
            : `${input.existingPortabilityvaultizabilityTableCount}/${CRITICAL_PORTABILITYVAULTIZABILITY_TABLES.length} portabilityvaultizability signal tables were found.`,
    },
    {
      name: 'billing_notification_portabilityvaultizability',
      label: 'Billing notification portabilityvaultizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification portabilityvaultizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification portabilityvaultizability signals.'
            : 'Production portabilityvaultizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_portabilityvaultizability',
      label: 'Billing webhook portabilityvaultizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook portabilityvaultizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook portabilityvaultizability signals.'
            : 'Production portabilityvaultizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          portabilityvaultizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              portabilityvaultizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production portabilityvaultizability rollout requires PostgreSQL connectivity, portabilityvaultizability tables, billing notification portabilityvaultizability, billing webhook portabilityvaultizability, and full signal coverage.',
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
        ? 'Production portabilityvaultizability rollout checks passed. Portabilityvaultizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production portabilityvaultizability rollout is not ready. Resolve failed checks before relying on production portabilityvaultizability tooling.',
  }
}

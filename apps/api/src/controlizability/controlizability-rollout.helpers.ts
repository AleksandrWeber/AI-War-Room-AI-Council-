import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CONTROLIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type ControlizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ControlizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ControlizabilityRolloutCheck[]
  guidance: string
}

export type ControlizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingControlizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateControlizabilityRollout(
  input: ControlizabilityRolloutInput,
): ControlizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const controlizabilityTableCoverageComplete =
    input.existingControlizabilityTableCount === CRITICAL_CONTROLIZABILITY_TABLES.length

  const checks: ControlizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL controlizability checks can reach the database.'
            : 'Production controlizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'controlizability_signal_table_coverage',
      label: 'Controlizability signal table coverage',
      status: controlizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Controlizability signal table coverage is only enforced in production.'
          : controlizabilityTableCoverageComplete
            ? `${input.existingControlizabilityTableCount}/${CRITICAL_CONTROLIZABILITY_TABLES.length} controlizability signal tables are present.`
            : `${input.existingControlizabilityTableCount}/${CRITICAL_CONTROLIZABILITY_TABLES.length} controlizability signal tables were found.`,
    },
    {
      name: 'billing_notification_controlizability',
      label: 'Billing notification controlizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification controlizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification controlizability signals.'
            : 'Production controlizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_controlizability',
      label: 'Billing webhook controlizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook controlizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook controlizability signals.'
            : 'Production controlizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          controlizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              controlizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production controlizability rollout requires PostgreSQL connectivity, controlizability tables, billing notification controlizability, billing webhook controlizability, and full signal coverage.',
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
        ? 'Production controlizability rollout checks passed. Controlizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production controlizability rollout is not ready. Resolve failed checks before relying on production controlizability tooling.',
  }
}

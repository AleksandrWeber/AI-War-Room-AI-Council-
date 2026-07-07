import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TELEMETRYIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type TelemetryizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TelemetryizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TelemetryizabilityRolloutCheck[]
  guidance: string
}

export type TelemetryizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTelemetryizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateTelemetryizabilityRollout(
  input: TelemetryizabilityRolloutInput,
): TelemetryizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const telemetryizabilityTableCoverageComplete =
    input.existingTelemetryizabilityTableCount === CRITICAL_TELEMETRYIZABILITY_TABLES.length

  const checks: TelemetryizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL telemetryizability checks can reach the database.'
            : 'Production telemetryizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'telemetryizability_signal_table_coverage',
      label: 'Telemetryizability signal table coverage',
      status: telemetryizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Telemetryizability signal table coverage is only enforced in production.'
          : telemetryizabilityTableCoverageComplete
            ? `${input.existingTelemetryizabilityTableCount}/${CRITICAL_TELEMETRYIZABILITY_TABLES.length} telemetryizability signal tables are present.`
            : `${input.existingTelemetryizabilityTableCount}/${CRITICAL_TELEMETRYIZABILITY_TABLES.length} telemetryizability signal tables were found.`,
    },
    {
      name: 'billing_notification_telemetryizability',
      label: 'Billing notification telemetryizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification telemetryizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification telemetryizability signals.'
            : 'Production telemetryizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_telemetryizability',
      label: 'Billing webhook telemetryizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook telemetryizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook telemetryizability signals.'
            : 'Production telemetryizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          telemetryizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              telemetryizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production telemetryizability rollout requires PostgreSQL connectivity, telemetryizability tables, billing notification telemetryizability, billing webhook telemetryizability, and full signal coverage.',
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
        ? 'Production telemetryizability rollout checks passed. Telemetryizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production telemetryizability rollout is not ready. Resolve failed checks before relying on production telemetryizability tooling.',
  }
}

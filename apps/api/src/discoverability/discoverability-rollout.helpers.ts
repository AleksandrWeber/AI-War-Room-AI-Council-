import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DISCOVERABILITY_TABLES = [
  'billing_meter_usage_reports',
  'billing_notifications',
  'billing_webhook_events',
] as const

export type DiscoverabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DiscoverabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DiscoverabilityRolloutCheck[]
  guidance: string
}

export type DiscoverabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDiscoverabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateDiscoverabilityRollout(
  input: DiscoverabilityRolloutInput,
): DiscoverabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const discoverabilityTableCoverageComplete =
    input.existingDiscoverabilityTableCount === CRITICAL_DISCOVERABILITY_TABLES.length

  const checks: DiscoverabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL discoverability checks can reach the database.'
            : 'Production discoverability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'discoverability_signal_table_coverage',
      label: 'Discoverability signal table coverage',
      status: discoverabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Discoverability signal table coverage is only enforced in production.'
          : discoverabilityTableCoverageComplete
            ? `${input.existingDiscoverabilityTableCount}/${CRITICAL_DISCOVERABILITY_TABLES.length} discoverability signal tables are present.`
            : `${input.existingDiscoverabilityTableCount}/${CRITICAL_DISCOVERABILITY_TABLES.length} discoverability signal tables were found.`,
    },
    {
      name: 'meter_usage_discoverability',
      label: 'Meter usage discoverability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage discoverability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage discoverability signals.'
            : 'Production discoverability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'billing_notification_discoverability',
      label: 'Billing notification discoverability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification discoverability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification discoverability signals.'
            : 'Production discoverability rollout requires a billing_notifications table.',
    },
    {
      name: 'discovery_readiness_signal',
      label: 'Discovery readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          discoverabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Discovery readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              discoverabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Meter usage reports, billing notifications, and billing webhook events support discovery readiness.'
            : 'Production discoverability rollout requires PostgreSQL connectivity, discoverability tables, meter usage discoverability, billing notification discoverability, and full signal coverage.',
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
        ? 'Production discoverability rollout checks passed. Discoverability coverage and discovery readiness signal signals are healthy.'
        : 'Production discoverability rollout is not ready. Resolve failed checks before relying on production discoverability tooling.',
  }
}

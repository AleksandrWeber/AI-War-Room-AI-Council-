import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ZEROTRUSTIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type ZerotrustizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ZerotrustizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ZerotrustizabilityRolloutCheck[]
  guidance: string
}

export type ZerotrustizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingZerotrustizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateZerotrustizabilityRollout(
  input: ZerotrustizabilityRolloutInput,
): ZerotrustizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const zerotrustizabilityTableCoverageComplete =
    input.existingZerotrustizabilityTableCount === CRITICAL_ZEROTRUSTIZABILITY_TABLES.length

  const checks: ZerotrustizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL zerotrustizability checks can reach the database.'
            : 'Production zerotrustizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'zerotrustizability_signal_table_coverage',
      label: 'Zerotrustizability signal table coverage',
      status: zerotrustizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Zerotrustizability signal table coverage is only enforced in production.'
          : zerotrustizabilityTableCoverageComplete
            ? `${input.existingZerotrustizabilityTableCount}/${CRITICAL_ZEROTRUSTIZABILITY_TABLES.length} zerotrustizability signal tables are present.`
            : `${input.existingZerotrustizabilityTableCount}/${CRITICAL_ZEROTRUSTIZABILITY_TABLES.length} zerotrustizability signal tables were found.`,
    },
    {
      name: 'billing_notification_zerotrustizability',
      label: 'Billing notification zerotrustizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification zerotrustizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification zerotrustizability signals.'
            : 'Production zerotrustizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_zerotrustizability',
      label: 'Billing webhook zerotrustizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook zerotrustizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook zerotrustizability signals.'
            : 'Production zerotrustizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          zerotrustizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              zerotrustizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production zerotrustizability rollout requires PostgreSQL connectivity, zerotrustizability tables, billing notification zerotrustizability, billing webhook zerotrustizability, and full signal coverage.',
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
        ? 'Production zerotrustizability rollout checks passed. Zerotrustizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production zerotrustizability rollout is not ready. Resolve failed checks before relying on production zerotrustizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SEGREGATIONIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type SegregationizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SegregationizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SegregationizabilityRolloutCheck[]
  guidance: string
}

export type SegregationizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSegregationizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateSegregationizabilityRollout(
  input: SegregationizabilityRolloutInput,
): SegregationizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const segregationizabilityTableCoverageComplete =
    input.existingSegregationizabilityTableCount === CRITICAL_SEGREGATIONIZABILITY_TABLES.length

  const checks: SegregationizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL segregationizability checks can reach the database.'
            : 'Production segregationizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'segregationizability_signal_table_coverage',
      label: 'Segregationizability signal table coverage',
      status: segregationizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Segregationizability signal table coverage is only enforced in production.'
          : segregationizabilityTableCoverageComplete
            ? `${input.existingSegregationizabilityTableCount}/${CRITICAL_SEGREGATIONIZABILITY_TABLES.length} segregationizability signal tables are present.`
            : `${input.existingSegregationizabilityTableCount}/${CRITICAL_SEGREGATIONIZABILITY_TABLES.length} segregationizability signal tables were found.`,
    },
    {
      name: 'billing_notification_segregationizability',
      label: 'Billing notification segregationizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification segregationizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification segregationizability signals.'
            : 'Production segregationizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_segregationizability',
      label: 'Billing webhook segregationizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook segregationizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook segregationizability signals.'
            : 'Production segregationizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          segregationizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              segregationizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production segregationizability rollout requires PostgreSQL connectivity, segregationizability tables, billing notification segregationizability, billing webhook segregationizability, and full signal coverage.',
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
        ? 'Production segregationizability rollout checks passed. Segregationizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production segregationizability rollout is not ready. Resolve failed checks before relying on production segregationizability tooling.',
  }
}

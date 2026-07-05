import type { ApiEnv } from '../config/env.js'

export const CRITICAL_OBSERVABILIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type ObservabilizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ObservabilizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ObservabilizabilityRolloutCheck[]
  guidance: string
}

export type ObservabilizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingObservabilizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateObservabilizabilityRollout(
  input: ObservabilizabilityRolloutInput,
): ObservabilizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const observabilizabilityTableCoverageComplete =
    input.existingObservabilizabilityTableCount === CRITICAL_OBSERVABILIZABILITY_TABLES.length

  const checks: ObservabilizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL observabilizability checks can reach the database.'
            : 'Production observabilizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'observabilizability_signal_table_coverage',
      label: 'Observabilizability signal table coverage',
      status: observabilizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Observabilizability signal table coverage is only enforced in production.'
          : observabilizabilityTableCoverageComplete
            ? `${input.existingObservabilizabilityTableCount}/${CRITICAL_OBSERVABILIZABILITY_TABLES.length} observabilizability signal tables are present.`
            : `${input.existingObservabilizabilityTableCount}/${CRITICAL_OBSERVABILIZABILITY_TABLES.length} observabilizability signal tables were found.`,
    },
    {
      name: 'billing_notification_observabilizability',
      label: 'Billing notification observabilizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification observabilizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification observabilizability signals.'
            : 'Production observabilizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_observabilizability',
      label: 'Billing webhook observabilizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook observabilizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook observabilizability signals.'
            : 'Production observabilizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'observabilization_readiness_signal',
      label: 'Observabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          observabilizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Observabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              observabilizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support observabilization readiness.'
            : 'Production observabilizability rollout requires PostgreSQL connectivity, observabilizability tables, billing notification observabilizability, billing webhook observabilizability, and full signal coverage.',
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
        ? 'Production observabilizability rollout checks passed. Observabilizability coverage and observabilization readiness signal signals are healthy.'
        : 'Production observabilizability rollout is not ready. Resolve failed checks before relying on production observabilizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TRUSTWORTHINESSVAULTIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type TrustworthinessvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TrustworthinessvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TrustworthinessvaultizabilityRolloutCheck[]
  guidance: string
}

export type TrustworthinessvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTrustworthinessvaultizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateTrustworthinessvaultizabilityRollout(
  input: TrustworthinessvaultizabilityRolloutInput,
): TrustworthinessvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const trustworthinessvaultizabilityTableCoverageComplete =
    input.existingTrustworthinessvaultizabilityTableCount === CRITICAL_TRUSTWORTHINESSVAULTIZABILITY_TABLES.length

  const checks: TrustworthinessvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL trustworthinessvaultizability checks can reach the database.'
            : 'Production trustworthinessvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'trustworthinessvaultizability_signal_table_coverage',
      label: 'Trustworthinessvaultizability signal table coverage',
      status: trustworthinessvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Trustworthinessvaultizability signal table coverage is only enforced in production.'
          : trustworthinessvaultizabilityTableCoverageComplete
            ? `${input.existingTrustworthinessvaultizabilityTableCount}/${CRITICAL_TRUSTWORTHINESSVAULTIZABILITY_TABLES.length} trustworthinessvaultizability signal tables are present.`
            : `${input.existingTrustworthinessvaultizabilityTableCount}/${CRITICAL_TRUSTWORTHINESSVAULTIZABILITY_TABLES.length} trustworthinessvaultizability signal tables were found.`,
    },
    {
      name: 'billing_notification_trustworthinessvaultizability',
      label: 'Billing notification trustworthinessvaultizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification trustworthinessvaultizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification trustworthinessvaultizability signals.'
            : 'Production trustworthinessvaultizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_trustworthinessvaultizability',
      label: 'Billing webhook trustworthinessvaultizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook trustworthinessvaultizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook trustworthinessvaultizability signals.'
            : 'Production trustworthinessvaultizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          trustworthinessvaultizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              trustworthinessvaultizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production trustworthinessvaultizability rollout requires PostgreSQL connectivity, trustworthinessvaultizability tables, billing notification trustworthinessvaultizability, billing webhook trustworthinessvaultizability, and full signal coverage.',
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
        ? 'Production trustworthinessvaultizability rollout checks passed. Trustworthinessvaultizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production trustworthinessvaultizability rollout is not ready. Resolve failed checks before relying on production trustworthinessvaultizability tooling.',
  }
}

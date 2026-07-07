import type { ApiEnv } from '../config/env.js'

export const CRITICAL_REVIEWABILITYVAULTIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type ReviewabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ReviewabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ReviewabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type ReviewabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingReviewabilityvaultizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateReviewabilityvaultizabilityRollout(
  input: ReviewabilityvaultizabilityRolloutInput,
): ReviewabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const reviewabilityvaultizabilityTableCoverageComplete =
    input.existingReviewabilityvaultizabilityTableCount === CRITICAL_REVIEWABILITYVAULTIZABILITY_TABLES.length

  const checks: ReviewabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL reviewabilityvaultizability checks can reach the database.'
            : 'Production reviewabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'reviewabilityvaultizability_signal_table_coverage',
      label: 'Reviewabilityvaultizability signal table coverage',
      status: reviewabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Reviewabilityvaultizability signal table coverage is only enforced in production.'
          : reviewabilityvaultizabilityTableCoverageComplete
            ? `${input.existingReviewabilityvaultizabilityTableCount}/${CRITICAL_REVIEWABILITYVAULTIZABILITY_TABLES.length} reviewabilityvaultizability signal tables are present.`
            : `${input.existingReviewabilityvaultizabilityTableCount}/${CRITICAL_REVIEWABILITYVAULTIZABILITY_TABLES.length} reviewabilityvaultizability signal tables were found.`,
    },
    {
      name: 'billing_notification_reviewabilityvaultizability',
      label: 'Billing notification reviewabilityvaultizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification reviewabilityvaultizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification reviewabilityvaultizability signals.'
            : 'Production reviewabilityvaultizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_reviewabilityvaultizability',
      label: 'Billing webhook reviewabilityvaultizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook reviewabilityvaultizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook reviewabilityvaultizability signals.'
            : 'Production reviewabilityvaultizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          reviewabilityvaultizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              reviewabilityvaultizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production reviewabilityvaultizability rollout requires PostgreSQL connectivity, reviewabilityvaultizability tables, billing notification reviewabilityvaultizability, billing webhook reviewabilityvaultizability, and full signal coverage.',
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
        ? 'Production reviewabilityvaultizability rollout checks passed. Reviewabilityvaultizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production reviewabilityvaultizability rollout is not ready. Resolve failed checks before relying on production reviewabilityvaultizability tooling.',
  }
}

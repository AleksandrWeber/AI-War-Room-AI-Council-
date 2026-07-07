import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PREDICTABILITYVAULTIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type PredictabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type PredictabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: PredictabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type PredictabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingPredictabilityvaultizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluatePredictabilityvaultizabilityRollout(
  input: PredictabilityvaultizabilityRolloutInput,
): PredictabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const predictabilityvaultizabilityTableCoverageComplete =
    input.existingPredictabilityvaultizabilityTableCount === CRITICAL_PREDICTABILITYVAULTIZABILITY_TABLES.length

  const checks: PredictabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL predictabilityvaultizability checks can reach the database.'
            : 'Production predictabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'predictabilityvaultizability_signal_table_coverage',
      label: 'Predictabilityvaultizability signal table coverage',
      status: predictabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Predictabilityvaultizability signal table coverage is only enforced in production.'
          : predictabilityvaultizabilityTableCoverageComplete
            ? `${input.existingPredictabilityvaultizabilityTableCount}/${CRITICAL_PREDICTABILITYVAULTIZABILITY_TABLES.length} predictabilityvaultizability signal tables are present.`
            : `${input.existingPredictabilityvaultizabilityTableCount}/${CRITICAL_PREDICTABILITYVAULTIZABILITY_TABLES.length} predictabilityvaultizability signal tables were found.`,
    },
    {
      name: 'billing_notification_predictabilityvaultizability',
      label: 'Billing notification predictabilityvaultizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification predictabilityvaultizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification predictabilityvaultizability signals.'
            : 'Production predictabilityvaultizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_predictabilityvaultizability',
      label: 'Billing webhook predictabilityvaultizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook predictabilityvaultizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook predictabilityvaultizability signals.'
            : 'Production predictabilityvaultizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          predictabilityvaultizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              predictabilityvaultizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production predictabilityvaultizability rollout requires PostgreSQL connectivity, predictabilityvaultizability tables, billing notification predictabilityvaultizability, billing webhook predictabilityvaultizability, and full signal coverage.',
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
        ? 'Production predictabilityvaultizability rollout checks passed. Predictabilityvaultizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production predictabilityvaultizability rollout is not ready. Resolve failed checks before relying on production predictabilityvaultizability tooling.',
  }
}

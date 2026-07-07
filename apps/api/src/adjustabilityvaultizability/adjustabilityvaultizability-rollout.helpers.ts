import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ADJUSTABILITYVAULTIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type AdjustabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AdjustabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AdjustabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type AdjustabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAdjustabilityvaultizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateAdjustabilityvaultizabilityRollout(
  input: AdjustabilityvaultizabilityRolloutInput,
): AdjustabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const adjustabilityvaultizabilityTableCoverageComplete =
    input.existingAdjustabilityvaultizabilityTableCount === CRITICAL_ADJUSTABILITYVAULTIZABILITY_TABLES.length

  const checks: AdjustabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL adjustabilityvaultizability checks can reach the database.'
            : 'Production adjustabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'adjustabilityvaultizability_signal_table_coverage',
      label: 'Adjustabilityvaultizability signal table coverage',
      status: adjustabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Adjustabilityvaultizability signal table coverage is only enforced in production.'
          : adjustabilityvaultizabilityTableCoverageComplete
            ? `${input.existingAdjustabilityvaultizabilityTableCount}/${CRITICAL_ADJUSTABILITYVAULTIZABILITY_TABLES.length} adjustabilityvaultizability signal tables are present.`
            : `${input.existingAdjustabilityvaultizabilityTableCount}/${CRITICAL_ADJUSTABILITYVAULTIZABILITY_TABLES.length} adjustabilityvaultizability signal tables were found.`,
    },
    {
      name: 'billing_notification_adjustabilityvaultizability',
      label: 'Billing notification adjustabilityvaultizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification adjustabilityvaultizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification adjustabilityvaultizability signals.'
            : 'Production adjustabilityvaultizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_adjustabilityvaultizability',
      label: 'Billing webhook adjustabilityvaultizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook adjustabilityvaultizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook adjustabilityvaultizability signals.'
            : 'Production adjustabilityvaultizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          adjustabilityvaultizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              adjustabilityvaultizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production adjustabilityvaultizability rollout requires PostgreSQL connectivity, adjustabilityvaultizability tables, billing notification adjustabilityvaultizability, billing webhook adjustabilityvaultizability, and full signal coverage.',
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
        ? 'Production adjustabilityvaultizability rollout checks passed. Adjustabilityvaultizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production adjustabilityvaultizability rollout is not ready. Resolve failed checks before relying on production adjustabilityvaultizability tooling.',
  }
}

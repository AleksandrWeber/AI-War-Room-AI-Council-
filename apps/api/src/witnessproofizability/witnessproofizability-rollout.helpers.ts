import type { ApiEnv } from '../config/env.js'

export const CRITICAL_WITNESSPROOFIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type WitnessproofizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type WitnessproofizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: WitnessproofizabilityRolloutCheck[]
  guidance: string
}

export type WitnessproofizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingWitnessproofizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateWitnessproofizabilityRollout(
  input: WitnessproofizabilityRolloutInput,
): WitnessproofizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const witnessproofizabilityTableCoverageComplete =
    input.existingWitnessproofizabilityTableCount === CRITICAL_WITNESSPROOFIZABILITY_TABLES.length

  const checks: WitnessproofizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL witnessproofizability checks can reach the database.'
            : 'Production witnessproofizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'witnessproofizability_signal_table_coverage',
      label: 'Witnessproofizability signal table coverage',
      status: witnessproofizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Witnessproofizability signal table coverage is only enforced in production.'
          : witnessproofizabilityTableCoverageComplete
            ? `${input.existingWitnessproofizabilityTableCount}/${CRITICAL_WITNESSPROOFIZABILITY_TABLES.length} witnessproofizability signal tables are present.`
            : `${input.existingWitnessproofizabilityTableCount}/${CRITICAL_WITNESSPROOFIZABILITY_TABLES.length} witnessproofizability signal tables were found.`,
    },
    {
      name: 'billing_notification_witnessproofizability',
      label: 'Billing notification witnessproofizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification witnessproofizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification witnessproofizability signals.'
            : 'Production witnessproofizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_witnessproofizability',
      label: 'Billing webhook witnessproofizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook witnessproofizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook witnessproofizability signals.'
            : 'Production witnessproofizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          witnessproofizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              witnessproofizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production witnessproofizability rollout requires PostgreSQL connectivity, witnessproofizability tables, billing notification witnessproofizability, billing webhook witnessproofizability, and full signal coverage.',
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
        ? 'Production witnessproofizability rollout checks passed. Witnessproofizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production witnessproofizability rollout is not ready. Resolve failed checks before relying on production witnessproofizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TAMPERPROOFIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type TamperproofizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TamperproofizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TamperproofizabilityRolloutCheck[]
  guidance: string
}

export type TamperproofizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTamperproofizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateTamperproofizabilityRollout(
  input: TamperproofizabilityRolloutInput,
): TamperproofizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const tamperproofizabilityTableCoverageComplete =
    input.existingTamperproofizabilityTableCount === CRITICAL_TAMPERPROOFIZABILITY_TABLES.length

  const checks: TamperproofizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL tamperproofizability checks can reach the database.'
            : 'Production tamperproofizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'tamperproofizability_signal_table_coverage',
      label: 'Tamperproofizability signal table coverage',
      status: tamperproofizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Tamperproofizability signal table coverage is only enforced in production.'
          : tamperproofizabilityTableCoverageComplete
            ? `${input.existingTamperproofizabilityTableCount}/${CRITICAL_TAMPERPROOFIZABILITY_TABLES.length} tamperproofizability signal tables are present.`
            : `${input.existingTamperproofizabilityTableCount}/${CRITICAL_TAMPERPROOFIZABILITY_TABLES.length} tamperproofizability signal tables were found.`,
    },
    {
      name: 'billing_notification_tamperproofizability',
      label: 'Billing notification tamperproofizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification tamperproofizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification tamperproofizability signals.'
            : 'Production tamperproofizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_tamperproofizability',
      label: 'Billing webhook tamperproofizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook tamperproofizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook tamperproofizability signals.'
            : 'Production tamperproofizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          tamperproofizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              tamperproofizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production tamperproofizability rollout requires PostgreSQL connectivity, tamperproofizability tables, billing notification tamperproofizability, billing webhook tamperproofizability, and full signal coverage.',
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
        ? 'Production tamperproofizability rollout checks passed. Tamperproofizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production tamperproofizability rollout is not ready. Resolve failed checks before relying on production tamperproofizability tooling.',
  }
}

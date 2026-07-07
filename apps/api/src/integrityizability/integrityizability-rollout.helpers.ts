import type { ApiEnv } from '../config/env.js'

export const CRITICAL_INTEGRITYIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type IntegrityizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type IntegrityizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: IntegrityizabilityRolloutCheck[]
  guidance: string
}

export type IntegrityizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingIntegrityizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateIntegrityizabilityRollout(
  input: IntegrityizabilityRolloutInput,
): IntegrityizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const integrityizabilityTableCoverageComplete =
    input.existingIntegrityizabilityTableCount === CRITICAL_INTEGRITYIZABILITY_TABLES.length

  const checks: IntegrityizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL integrityizability checks can reach the database.'
            : 'Production integrityizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'integrityizability_signal_table_coverage',
      label: 'Integrityizability signal table coverage',
      status: integrityizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Integrityizability signal table coverage is only enforced in production.'
          : integrityizabilityTableCoverageComplete
            ? `${input.existingIntegrityizabilityTableCount}/${CRITICAL_INTEGRITYIZABILITY_TABLES.length} integrityizability signal tables are present.`
            : `${input.existingIntegrityizabilityTableCount}/${CRITICAL_INTEGRITYIZABILITY_TABLES.length} integrityizability signal tables were found.`,
    },
    {
      name: 'billing_notification_integrityizability',
      label: 'Billing notification integrityizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification integrityizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification integrityizability signals.'
            : 'Production integrityizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_integrityizability',
      label: 'Billing webhook integrityizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook integrityizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook integrityizability signals.'
            : 'Production integrityizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          integrityizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              integrityizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production integrityizability rollout requires PostgreSQL connectivity, integrityizability tables, billing notification integrityizability, billing webhook integrityizability, and full signal coverage.',
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
        ? 'Production integrityizability rollout checks passed. Integrityizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production integrityizability rollout is not ready. Resolve failed checks before relying on production integrityizability tooling.',
  }
}

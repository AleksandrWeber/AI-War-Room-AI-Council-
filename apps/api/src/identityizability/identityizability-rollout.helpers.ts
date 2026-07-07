import type { ApiEnv } from '../config/env.js'

export const CRITICAL_IDENTITYIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type IdentityizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type IdentityizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: IdentityizabilityRolloutCheck[]
  guidance: string
}

export type IdentityizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingIdentityizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateIdentityizabilityRollout(
  input: IdentityizabilityRolloutInput,
): IdentityizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const identityizabilityTableCoverageComplete =
    input.existingIdentityizabilityTableCount === CRITICAL_IDENTITYIZABILITY_TABLES.length

  const checks: IdentityizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL identityizability checks can reach the database.'
            : 'Production identityizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'identityizability_signal_table_coverage',
      label: 'Identityizability signal table coverage',
      status: identityizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Identityizability signal table coverage is only enforced in production.'
          : identityizabilityTableCoverageComplete
            ? `${input.existingIdentityizabilityTableCount}/${CRITICAL_IDENTITYIZABILITY_TABLES.length} identityizability signal tables are present.`
            : `${input.existingIdentityizabilityTableCount}/${CRITICAL_IDENTITYIZABILITY_TABLES.length} identityizability signal tables were found.`,
    },
    {
      name: 'billing_notification_identityizability',
      label: 'Billing notification identityizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification identityizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification identityizability signals.'
            : 'Production identityizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_identityizability',
      label: 'Billing webhook identityizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook identityizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook identityizability signals.'
            : 'Production identityizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          identityizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              identityizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production identityizability rollout requires PostgreSQL connectivity, identityizability tables, billing notification identityizability, billing webhook identityizability, and full signal coverage.',
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
        ? 'Production identityizability rollout checks passed. Identityizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production identityizability rollout is not ready. Resolve failed checks before relying on production identityizability tooling.',
  }
}

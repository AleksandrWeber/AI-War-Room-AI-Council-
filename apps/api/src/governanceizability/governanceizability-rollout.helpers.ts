import type { ApiEnv } from '../config/env.js'

export const CRITICAL_GOVERNANCEIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type GovernanceizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type GovernanceizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: GovernanceizabilityRolloutCheck[]
  guidance: string
}

export type GovernanceizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingGovernanceizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateGovernanceizabilityRollout(
  input: GovernanceizabilityRolloutInput,
): GovernanceizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const governanceizabilityTableCoverageComplete =
    input.existingGovernanceizabilityTableCount === CRITICAL_GOVERNANCEIZABILITY_TABLES.length

  const checks: GovernanceizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL governanceizability checks can reach the database.'
            : 'Production governanceizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'governanceizability_signal_table_coverage',
      label: 'Governanceizability signal table coverage',
      status: governanceizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Governanceizability signal table coverage is only enforced in production.'
          : governanceizabilityTableCoverageComplete
            ? `${input.existingGovernanceizabilityTableCount}/${CRITICAL_GOVERNANCEIZABILITY_TABLES.length} governanceizability signal tables are present.`
            : `${input.existingGovernanceizabilityTableCount}/${CRITICAL_GOVERNANCEIZABILITY_TABLES.length} governanceizability signal tables were found.`,
    },
    {
      name: 'billing_notification_governanceizability',
      label: 'Billing notification governanceizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification governanceizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification governanceizability signals.'
            : 'Production governanceizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_governanceizability',
      label: 'Billing webhook governanceizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook governanceizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook governanceizability signals.'
            : 'Production governanceizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          governanceizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              governanceizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production governanceizability rollout requires PostgreSQL connectivity, governanceizability tables, billing notification governanceizability, billing webhook governanceizability, and full signal coverage.',
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
        ? 'Production governanceizability rollout checks passed. Governanceizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production governanceizability rollout is not ready. Resolve failed checks before relying on production governanceizability tooling.',
  }
}

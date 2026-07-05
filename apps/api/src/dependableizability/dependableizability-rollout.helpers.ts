import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DEPENDABLEIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type DependableizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DependableizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DependableizabilityRolloutCheck[]
  guidance: string
}

export type DependableizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDependableizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateDependableizabilityRollout(
  input: DependableizabilityRolloutInput,
): DependableizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const dependableizabilityTableCoverageComplete =
    input.existingDependableizabilityTableCount === CRITICAL_DEPENDABLEIZABILITY_TABLES.length

  const checks: DependableizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL dependableizability checks can reach the database.'
            : 'Production dependableizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'dependableizability_signal_table_coverage',
      label: 'Dependableizability signal table coverage',
      status: dependableizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Dependableizability signal table coverage is only enforced in production.'
          : dependableizabilityTableCoverageComplete
            ? `${input.existingDependableizabilityTableCount}/${CRITICAL_DEPENDABLEIZABILITY_TABLES.length} dependableizability signal tables are present.`
            : `${input.existingDependableizabilityTableCount}/${CRITICAL_DEPENDABLEIZABILITY_TABLES.length} dependableizability signal tables were found.`,
    },
    {
      name: 'billing_notification_dependableizability',
      label: 'Billing notification dependableizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification dependableizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification dependableizability signals.'
            : 'Production dependableizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_dependableizability',
      label: 'Billing webhook dependableizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook dependableizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook dependableizability signals.'
            : 'Production dependableizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'dependabilization_readiness_signal',
      label: 'Dependabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          dependableizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Dependabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              dependableizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support dependabilization readiness.'
            : 'Production dependableizability rollout requires PostgreSQL connectivity, dependableizability tables, billing notification dependableizability, billing webhook dependableizability, and full signal coverage.',
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
        ? 'Production dependableizability rollout checks passed. Dependableizability coverage and dependabilization readiness signal signals are healthy.'
        : 'Production dependableizability rollout is not ready. Resolve failed checks before relying on production dependableizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_RECOVERYIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type RecoveryizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RecoveryizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RecoveryizabilityRolloutCheck[]
  guidance: string
}

export type RecoveryizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRecoveryizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateRecoveryizabilityRollout(
  input: RecoveryizabilityRolloutInput,
): RecoveryizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const recoveryizabilityTableCoverageComplete =
    input.existingRecoveryizabilityTableCount === CRITICAL_RECOVERYIZABILITY_TABLES.length

  const checks: RecoveryizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL recoveryizability checks can reach the database.'
            : 'Production recoveryizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'recoveryizability_signal_table_coverage',
      label: 'Recoveryizability signal table coverage',
      status: recoveryizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Recoveryizability signal table coverage is only enforced in production.'
          : recoveryizabilityTableCoverageComplete
            ? `${input.existingRecoveryizabilityTableCount}/${CRITICAL_RECOVERYIZABILITY_TABLES.length} recoveryizability signal tables are present.`
            : `${input.existingRecoveryizabilityTableCount}/${CRITICAL_RECOVERYIZABILITY_TABLES.length} recoveryizability signal tables were found.`,
    },
    {
      name: 'billing_notification_recoveryizability',
      label: 'Billing notification recoveryizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification recoveryizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification recoveryizability signals.'
            : 'Production recoveryizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_recoveryizability',
      label: 'Billing webhook recoveryizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook recoveryizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook recoveryizability signals.'
            : 'Production recoveryizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'recoveryization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          recoveryizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              recoveryizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support recoveryization readiness.'
            : 'Production recoveryizability rollout requires PostgreSQL connectivity, recoveryizability tables, billing notification recoveryizability, billing webhook recoveryizability, and full signal coverage.',
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
        ? 'Production recoveryizability rollout checks passed. Recoveryizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production recoveryizability rollout is not ready. Resolve failed checks before relying on production recoveryizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TRIGGERIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type TriggerizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TriggerizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TriggerizabilityRolloutCheck[]
  guidance: string
}

export type TriggerizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTriggerizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateTriggerizabilityRollout(
  input: TriggerizabilityRolloutInput,
): TriggerizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const triggerizabilityTableCoverageComplete =
    input.existingTriggerizabilityTableCount === CRITICAL_TRIGGERIZABILITY_TABLES.length

  const checks: TriggerizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL triggerizability checks can reach the database.'
            : 'Production triggerizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'triggerizability_signal_table_coverage',
      label: 'Triggerizability signal table coverage',
      status: triggerizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Triggerizability signal table coverage is only enforced in production.'
          : triggerizabilityTableCoverageComplete
            ? `${input.existingTriggerizabilityTableCount}/${CRITICAL_TRIGGERIZABILITY_TABLES.length} triggerizability signal tables are present.`
            : `${input.existingTriggerizabilityTableCount}/${CRITICAL_TRIGGERIZABILITY_TABLES.length} triggerizability signal tables were found.`,
    },
    {
      name: 'billing_notification_triggerizability',
      label: 'Billing notification triggerizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification triggerizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification triggerizability signals.'
            : 'Production triggerizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_triggerizability',
      label: 'Billing webhook triggerizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook triggerizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook triggerizability signals.'
            : 'Production triggerizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'triggerization_readiness_signal',
      label: 'Triggerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          triggerizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Triggerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              triggerizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support triggerization readiness.'
            : 'Production triggerizability rollout requires PostgreSQL connectivity, triggerizability tables, billing notification triggerizability, billing webhook triggerizability, and full signal coverage.',
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
        ? 'Production triggerizability rollout checks passed. Triggerizability coverage and triggerization readiness signal signals are healthy.'
        : 'Production triggerizability rollout is not ready. Resolve failed checks before relying on production triggerizability tooling.',
  }
}

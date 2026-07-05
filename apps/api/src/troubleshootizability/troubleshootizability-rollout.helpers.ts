import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TROUBLESHOOTIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type TroubleshootizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TroubleshootizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TroubleshootizabilityRolloutCheck[]
  guidance: string
}

export type TroubleshootizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTroubleshootizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateTroubleshootizabilityRollout(
  input: TroubleshootizabilityRolloutInput,
): TroubleshootizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const troubleshootizabilityTableCoverageComplete =
    input.existingTroubleshootizabilityTableCount === CRITICAL_TROUBLESHOOTIZABILITY_TABLES.length

  const checks: TroubleshootizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL troubleshootizability checks can reach the database.'
            : 'Production troubleshootizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'troubleshootizability_signal_table_coverage',
      label: 'Troubleshootizability signal table coverage',
      status: troubleshootizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Troubleshootizability signal table coverage is only enforced in production.'
          : troubleshootizabilityTableCoverageComplete
            ? `${input.existingTroubleshootizabilityTableCount}/${CRITICAL_TROUBLESHOOTIZABILITY_TABLES.length} troubleshootizability signal tables are present.`
            : `${input.existingTroubleshootizabilityTableCount}/${CRITICAL_TROUBLESHOOTIZABILITY_TABLES.length} troubleshootizability signal tables were found.`,
    },
    {
      name: 'billing_notification_troubleshootizability',
      label: 'Billing notification troubleshootizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification troubleshootizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification troubleshootizability signals.'
            : 'Production troubleshootizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_troubleshootizability',
      label: 'Billing webhook troubleshootizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook troubleshootizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook troubleshootizability signals.'
            : 'Production troubleshootizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'troubleshootization_readiness_signal',
      label: 'Troubleshootization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          troubleshootizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Troubleshootization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              troubleshootizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support troubleshootization readiness.'
            : 'Production troubleshootizability rollout requires PostgreSQL connectivity, troubleshootizability tables, billing notification troubleshootizability, billing webhook troubleshootizability, and full signal coverage.',
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
        ? 'Production troubleshootizability rollout checks passed. Troubleshootizability coverage and troubleshootization readiness signal signals are healthy.'
        : 'Production troubleshootizability rollout is not ready. Resolve failed checks before relying on production troubleshootizability tooling.',
  }
}

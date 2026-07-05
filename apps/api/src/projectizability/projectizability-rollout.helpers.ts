import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PROJECTIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type ProjectizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ProjectizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ProjectizabilityRolloutCheck[]
  guidance: string
}

export type ProjectizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingProjectizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateProjectizabilityRollout(
  input: ProjectizabilityRolloutInput,
): ProjectizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const projectizabilityTableCoverageComplete =
    input.existingProjectizabilityTableCount === CRITICAL_PROJECTIZABILITY_TABLES.length

  const checks: ProjectizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL projectizability checks can reach the database.'
            : 'Production projectizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'projectizability_signal_table_coverage',
      label: 'Projectizability signal table coverage',
      status: projectizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Projectizability signal table coverage is only enforced in production.'
          : projectizabilityTableCoverageComplete
            ? `${input.existingProjectizabilityTableCount}/${CRITICAL_PROJECTIZABILITY_TABLES.length} projectizability signal tables are present.`
            : `${input.existingProjectizabilityTableCount}/${CRITICAL_PROJECTIZABILITY_TABLES.length} projectizability signal tables were found.`,
    },
    {
      name: 'billing_notification_projectizability',
      label: 'Billing notification projectizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification projectizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification projectizability signals.'
            : 'Production projectizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_projectizability',
      label: 'Billing webhook projectizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook projectizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook projectizability signals.'
            : 'Production projectizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'projectization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          projectizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              projectizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support projectization readiness.'
            : 'Production projectizability rollout requires PostgreSQL connectivity, projectizability tables, billing notification projectizability, billing webhook projectizability, and full signal coverage.',
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
        ? 'Production projectizability rollout checks passed. Projectizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production projectizability rollout is not ready. Resolve failed checks before relying on production projectizability tooling.',
  }
}

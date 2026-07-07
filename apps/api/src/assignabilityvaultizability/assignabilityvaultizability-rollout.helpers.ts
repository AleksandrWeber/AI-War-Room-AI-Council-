import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ASSIGNABILITYVAULTIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type AssignabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AssignabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AssignabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type AssignabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAssignabilityvaultizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateAssignabilityvaultizabilityRollout(
  input: AssignabilityvaultizabilityRolloutInput,
): AssignabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const assignabilityvaultizabilityTableCoverageComplete =
    input.existingAssignabilityvaultizabilityTableCount === CRITICAL_ASSIGNABILITYVAULTIZABILITY_TABLES.length

  const checks: AssignabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL assignabilityvaultizability checks can reach the database.'
            : 'Production assignabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'assignabilityvaultizability_signal_table_coverage',
      label: 'Assignabilityvaultizability signal table coverage',
      status: assignabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Assignabilityvaultizability signal table coverage is only enforced in production.'
          : assignabilityvaultizabilityTableCoverageComplete
            ? `${input.existingAssignabilityvaultizabilityTableCount}/${CRITICAL_ASSIGNABILITYVAULTIZABILITY_TABLES.length} assignabilityvaultizability signal tables are present.`
            : `${input.existingAssignabilityvaultizabilityTableCount}/${CRITICAL_ASSIGNABILITYVAULTIZABILITY_TABLES.length} assignabilityvaultizability signal tables were found.`,
    },
    {
      name: 'billing_notification_assignabilityvaultizability',
      label: 'Billing notification assignabilityvaultizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification assignabilityvaultizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification assignabilityvaultizability signals.'
            : 'Production assignabilityvaultizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_assignabilityvaultizability',
      label: 'Billing webhook assignabilityvaultizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook assignabilityvaultizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook assignabilityvaultizability signals.'
            : 'Production assignabilityvaultizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          assignabilityvaultizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              assignabilityvaultizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production assignabilityvaultizability rollout requires PostgreSQL connectivity, assignabilityvaultizability tables, billing notification assignabilityvaultizability, billing webhook assignabilityvaultizability, and full signal coverage.',
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
        ? 'Production assignabilityvaultizability rollout checks passed. Assignabilityvaultizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production assignabilityvaultizability rollout is not ready. Resolve failed checks before relying on production assignabilityvaultizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_AUDITREGISTRYIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type AuditregistryizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AuditregistryizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AuditregistryizabilityRolloutCheck[]
  guidance: string
}

export type AuditregistryizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAuditregistryizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateAuditregistryizabilityRollout(
  input: AuditregistryizabilityRolloutInput,
): AuditregistryizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const auditregistryizabilityTableCoverageComplete =
    input.existingAuditregistryizabilityTableCount === CRITICAL_AUDITREGISTRYIZABILITY_TABLES.length

  const checks: AuditregistryizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL auditregistryizability checks can reach the database.'
            : 'Production auditregistryizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'auditregistryizability_signal_table_coverage',
      label: 'Auditregistryizability signal table coverage',
      status: auditregistryizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Auditregistryizability signal table coverage is only enforced in production.'
          : auditregistryizabilityTableCoverageComplete
            ? `${input.existingAuditregistryizabilityTableCount}/${CRITICAL_AUDITREGISTRYIZABILITY_TABLES.length} auditregistryizability signal tables are present.`
            : `${input.existingAuditregistryizabilityTableCount}/${CRITICAL_AUDITREGISTRYIZABILITY_TABLES.length} auditregistryizability signal tables were found.`,
    },
    {
      name: 'billing_notification_auditregistryizability',
      label: 'Billing notification auditregistryizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification auditregistryizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification auditregistryizability signals.'
            : 'Production auditregistryizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_auditregistryizability',
      label: 'Billing webhook auditregistryizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook auditregistryizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook auditregistryizability signals.'
            : 'Production auditregistryizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          auditregistryizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              auditregistryizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production auditregistryizability rollout requires PostgreSQL connectivity, auditregistryizability tables, billing notification auditregistryizability, billing webhook auditregistryizability, and full signal coverage.',
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
        ? 'Production auditregistryizability rollout checks passed. Auditregistryizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production auditregistryizability rollout is not ready. Resolve failed checks before relying on production auditregistryizability tooling.',
  }
}

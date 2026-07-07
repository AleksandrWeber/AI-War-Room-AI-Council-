import type { ApiEnv } from '../config/env.js'

export const CRITICAL_AUDITPROOFIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type AuditproofizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AuditproofizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AuditproofizabilityRolloutCheck[]
  guidance: string
}

export type AuditproofizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAuditproofizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateAuditproofizabilityRollout(
  input: AuditproofizabilityRolloutInput,
): AuditproofizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const auditproofizabilityTableCoverageComplete =
    input.existingAuditproofizabilityTableCount === CRITICAL_AUDITPROOFIZABILITY_TABLES.length

  const checks: AuditproofizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL auditproofizability checks can reach the database.'
            : 'Production auditproofizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'auditproofizability_signal_table_coverage',
      label: 'Auditproofizability signal table coverage',
      status: auditproofizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Auditproofizability signal table coverage is only enforced in production.'
          : auditproofizabilityTableCoverageComplete
            ? `${input.existingAuditproofizabilityTableCount}/${CRITICAL_AUDITPROOFIZABILITY_TABLES.length} auditproofizability signal tables are present.`
            : `${input.existingAuditproofizabilityTableCount}/${CRITICAL_AUDITPROOFIZABILITY_TABLES.length} auditproofizability signal tables were found.`,
    },
    {
      name: 'billing_notification_auditproofizability',
      label: 'Billing notification auditproofizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification auditproofizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification auditproofizability signals.'
            : 'Production auditproofizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_auditproofizability',
      label: 'Billing webhook auditproofizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook auditproofizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook auditproofizability signals.'
            : 'Production auditproofizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          auditproofizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              auditproofizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production auditproofizability rollout requires PostgreSQL connectivity, auditproofizability tables, billing notification auditproofizability, billing webhook auditproofizability, and full signal coverage.',
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
        ? 'Production auditproofizability rollout checks passed. Auditproofizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production auditproofizability rollout is not ready. Resolve failed checks before relying on production auditproofizability tooling.',
  }
}

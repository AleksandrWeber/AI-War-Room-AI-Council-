import type { ApiEnv } from '../config/env.js'

export const CRITICAL_AUDITJOURNALIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type AuditjournalizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AuditjournalizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AuditjournalizabilityRolloutCheck[]
  guidance: string
}

export type AuditjournalizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAuditjournalizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateAuditjournalizabilityRollout(
  input: AuditjournalizabilityRolloutInput,
): AuditjournalizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const auditjournalizabilityTableCoverageComplete =
    input.existingAuditjournalizabilityTableCount === CRITICAL_AUDITJOURNALIZABILITY_TABLES.length

  const checks: AuditjournalizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL auditjournalizability checks can reach the database.'
            : 'Production auditjournalizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'auditjournalizability_signal_table_coverage',
      label: 'Auditjournalizability signal table coverage',
      status: auditjournalizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Auditjournalizability signal table coverage is only enforced in production.'
          : auditjournalizabilityTableCoverageComplete
            ? `${input.existingAuditjournalizabilityTableCount}/${CRITICAL_AUDITJOURNALIZABILITY_TABLES.length} auditjournalizability signal tables are present.`
            : `${input.existingAuditjournalizabilityTableCount}/${CRITICAL_AUDITJOURNALIZABILITY_TABLES.length} auditjournalizability signal tables were found.`,
    },
    {
      name: 'billing_notification_auditjournalizability',
      label: 'Billing notification auditjournalizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification auditjournalizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification auditjournalizability signals.'
            : 'Production auditjournalizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_auditjournalizability',
      label: 'Billing webhook auditjournalizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook auditjournalizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook auditjournalizability signals.'
            : 'Production auditjournalizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          auditjournalizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              auditjournalizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production auditjournalizability rollout requires PostgreSQL connectivity, auditjournalizability tables, billing notification auditjournalizability, billing webhook auditjournalizability, and full signal coverage.',
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
        ? 'Production auditjournalizability rollout checks passed. Auditjournalizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production auditjournalizability rollout is not ready. Resolve failed checks before relying on production auditjournalizability tooling.',
  }
}

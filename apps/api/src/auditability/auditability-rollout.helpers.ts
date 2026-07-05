import type { ApiEnv } from '../config/env.js'

export const CRITICAL_AUDITABILITY_TABLES = [
  'usage_events',
  'billing_webhook_events',
  'billing_notifications',
] as const

export type AuditabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AuditabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AuditabilityRolloutCheck[]
  guidance: string
}

export type AuditabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAuditabilityTableCount: number
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateAuditabilityRollout(
  input: AuditabilityRolloutInput,
): AuditabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const auditabilityTableCoverageComplete =
    input.existingAuditabilityTableCount === CRITICAL_AUDITABILITY_TABLES.length

  const checks: AuditabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL auditability checks can reach the database.'
            : 'Production auditability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'auditability_signal_table_coverage',
      label: 'Auditability signal table coverage',
      status: auditabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Auditability signal table coverage is only enforced in production.'
          : auditabilityTableCoverageComplete
            ? `${input.existingAuditabilityTableCount}/${CRITICAL_AUDITABILITY_TABLES.length} auditability signal tables are present.`
            : `${input.existingAuditabilityTableCount}/${CRITICAL_AUDITABILITY_TABLES.length} auditability signal tables were found.`,
    },
    {
      name: 'usage_auditability',
      label: 'Usage auditability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage auditability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage auditability signals.'
            : 'Production auditability rollout requires a usage_events table.',
    },
    {
      name: 'billing_webhook_auditability',
      label: 'Billing webhook auditability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook auditability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook auditability signals.'
            : 'Production auditability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'examination_readiness_signal',
      label: 'Examination readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          auditabilityTableCoverageComplete &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Examination readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              auditabilityTableCoverageComplete &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Usage events, billing webhook events, and billing notifications support examination readiness.'
            : 'Production auditability rollout requires PostgreSQL connectivity, auditability tables, usage auditability, billing webhook auditability, and full signal coverage.',
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
        ? 'Production auditability rollout checks passed. Auditability coverage and examination readiness signal signals are healthy.'
        : 'Production auditability rollout is not ready. Resolve failed checks before relying on production auditability tooling.',
  }
}

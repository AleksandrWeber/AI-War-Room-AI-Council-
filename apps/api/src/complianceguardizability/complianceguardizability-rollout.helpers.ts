import type { ApiEnv } from '../config/env.js'

export const CRITICAL_COMPLIANCEGUARDIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type ComplianceguardizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ComplianceguardizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ComplianceguardizabilityRolloutCheck[]
  guidance: string
}

export type ComplianceguardizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingComplianceguardizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateComplianceguardizabilityRollout(
  input: ComplianceguardizabilityRolloutInput,
): ComplianceguardizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const complianceguardizabilityTableCoverageComplete =
    input.existingComplianceguardizabilityTableCount === CRITICAL_COMPLIANCEGUARDIZABILITY_TABLES.length

  const checks: ComplianceguardizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL complianceguardizability checks can reach the database.'
            : 'Production complianceguardizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'complianceguardizability_signal_table_coverage',
      label: 'Complianceguardizability signal table coverage',
      status: complianceguardizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Complianceguardizability signal table coverage is only enforced in production.'
          : complianceguardizabilityTableCoverageComplete
            ? `${input.existingComplianceguardizabilityTableCount}/${CRITICAL_COMPLIANCEGUARDIZABILITY_TABLES.length} complianceguardizability signal tables are present.`
            : `${input.existingComplianceguardizabilityTableCount}/${CRITICAL_COMPLIANCEGUARDIZABILITY_TABLES.length} complianceguardizability signal tables were found.`,
    },
    {
      name: 'billing_notification_complianceguardizability',
      label: 'Billing notification complianceguardizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification complianceguardizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification complianceguardizability signals.'
            : 'Production complianceguardizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_complianceguardizability',
      label: 'Billing webhook complianceguardizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook complianceguardizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook complianceguardizability signals.'
            : 'Production complianceguardizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          complianceguardizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              complianceguardizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production complianceguardizability rollout requires PostgreSQL connectivity, complianceguardizability tables, billing notification complianceguardizability, billing webhook complianceguardizability, and full signal coverage.',
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
        ? 'Production complianceguardizability rollout checks passed. Complianceguardizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production complianceguardizability rollout is not ready. Resolve failed checks before relying on production complianceguardizability tooling.',
  }
}

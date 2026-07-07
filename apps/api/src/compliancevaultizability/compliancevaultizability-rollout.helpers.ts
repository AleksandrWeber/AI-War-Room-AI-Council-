import type { ApiEnv } from '../config/env.js'

export const CRITICAL_COMPLIANCEVAULTIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type CompliancevaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CompliancevaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CompliancevaultizabilityRolloutCheck[]
  guidance: string
}

export type CompliancevaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCompliancevaultizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateCompliancevaultizabilityRollout(
  input: CompliancevaultizabilityRolloutInput,
): CompliancevaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const compliancevaultizabilityTableCoverageComplete =
    input.existingCompliancevaultizabilityTableCount === CRITICAL_COMPLIANCEVAULTIZABILITY_TABLES.length

  const checks: CompliancevaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL compliancevaultizability checks can reach the database.'
            : 'Production compliancevaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'compliancevaultizability_signal_table_coverage',
      label: 'Compliancevaultizability signal table coverage',
      status: compliancevaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Compliancevaultizability signal table coverage is only enforced in production.'
          : compliancevaultizabilityTableCoverageComplete
            ? `${input.existingCompliancevaultizabilityTableCount}/${CRITICAL_COMPLIANCEVAULTIZABILITY_TABLES.length} compliancevaultizability signal tables are present.`
            : `${input.existingCompliancevaultizabilityTableCount}/${CRITICAL_COMPLIANCEVAULTIZABILITY_TABLES.length} compliancevaultizability signal tables were found.`,
    },
    {
      name: 'billing_notification_compliancevaultizability',
      label: 'Billing notification compliancevaultizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification compliancevaultizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification compliancevaultizability signals.'
            : 'Production compliancevaultizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_compliancevaultizability',
      label: 'Billing webhook compliancevaultizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook compliancevaultizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook compliancevaultizability signals.'
            : 'Production compliancevaultizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          compliancevaultizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              compliancevaultizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production compliancevaultizability rollout requires PostgreSQL connectivity, compliancevaultizability tables, billing notification compliancevaultizability, billing webhook compliancevaultizability, and full signal coverage.',
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
        ? 'Production compliancevaultizability rollout checks passed. Compliancevaultizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production compliancevaultizability rollout is not ready. Resolve failed checks before relying on production compliancevaultizability tooling.',
  }
}

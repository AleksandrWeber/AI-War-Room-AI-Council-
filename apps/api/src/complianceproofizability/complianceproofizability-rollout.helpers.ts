import type { ApiEnv } from '../config/env.js'

export const CRITICAL_COMPLIANCEPROOFIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type ComplianceproofizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ComplianceproofizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ComplianceproofizabilityRolloutCheck[]
  guidance: string
}

export type ComplianceproofizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingComplianceproofizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateComplianceproofizabilityRollout(
  input: ComplianceproofizabilityRolloutInput,
): ComplianceproofizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const complianceproofizabilityTableCoverageComplete =
    input.existingComplianceproofizabilityTableCount === CRITICAL_COMPLIANCEPROOFIZABILITY_TABLES.length

  const checks: ComplianceproofizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL complianceproofizability checks can reach the database.'
            : 'Production complianceproofizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'complianceproofizability_signal_table_coverage',
      label: 'Complianceproofizability signal table coverage',
      status: complianceproofizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Complianceproofizability signal table coverage is only enforced in production.'
          : complianceproofizabilityTableCoverageComplete
            ? `${input.existingComplianceproofizabilityTableCount}/${CRITICAL_COMPLIANCEPROOFIZABILITY_TABLES.length} complianceproofizability signal tables are present.`
            : `${input.existingComplianceproofizabilityTableCount}/${CRITICAL_COMPLIANCEPROOFIZABILITY_TABLES.length} complianceproofizability signal tables were found.`,
    },
    {
      name: 'billing_notification_complianceproofizability',
      label: 'Billing notification complianceproofizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification complianceproofizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification complianceproofizability signals.'
            : 'Production complianceproofizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_complianceproofizability',
      label: 'Billing webhook complianceproofizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook complianceproofizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook complianceproofizability signals.'
            : 'Production complianceproofizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          complianceproofizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              complianceproofizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production complianceproofizability rollout requires PostgreSQL connectivity, complianceproofizability tables, billing notification complianceproofizability, billing webhook complianceproofizability, and full signal coverage.',
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
        ? 'Production complianceproofizability rollout checks passed. Complianceproofizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production complianceproofizability rollout is not ready. Resolve failed checks before relying on production complianceproofizability tooling.',
  }
}

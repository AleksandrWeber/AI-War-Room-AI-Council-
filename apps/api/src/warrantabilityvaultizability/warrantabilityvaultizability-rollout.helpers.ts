import type { ApiEnv } from '../config/env.js'

export const CRITICAL_WARRANTABILITYVAULTIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type WarrantabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type WarrantabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: WarrantabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type WarrantabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingWarrantabilityvaultizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateWarrantabilityvaultizabilityRollout(
  input: WarrantabilityvaultizabilityRolloutInput,
): WarrantabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const warrantabilityvaultizabilityTableCoverageComplete =
    input.existingWarrantabilityvaultizabilityTableCount === CRITICAL_WARRANTABILITYVAULTIZABILITY_TABLES.length

  const checks: WarrantabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL warrantabilityvaultizability checks can reach the database.'
            : 'Production warrantabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'warrantabilityvaultizability_signal_table_coverage',
      label: 'Warrantabilityvaultizability signal table coverage',
      status: warrantabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Warrantabilityvaultizability signal table coverage is only enforced in production.'
          : warrantabilityvaultizabilityTableCoverageComplete
            ? `${input.existingWarrantabilityvaultizabilityTableCount}/${CRITICAL_WARRANTABILITYVAULTIZABILITY_TABLES.length} warrantabilityvaultizability signal tables are present.`
            : `${input.existingWarrantabilityvaultizabilityTableCount}/${CRITICAL_WARRANTABILITYVAULTIZABILITY_TABLES.length} warrantabilityvaultizability signal tables were found.`,
    },
    {
      name: 'billing_notification_warrantabilityvaultizability',
      label: 'Billing notification warrantabilityvaultizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification warrantabilityvaultizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification warrantabilityvaultizability signals.'
            : 'Production warrantabilityvaultizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_warrantabilityvaultizability',
      label: 'Billing webhook warrantabilityvaultizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook warrantabilityvaultizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook warrantabilityvaultizability signals.'
            : 'Production warrantabilityvaultizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          warrantabilityvaultizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              warrantabilityvaultizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production warrantabilityvaultizability rollout requires PostgreSQL connectivity, warrantabilityvaultizability tables, billing notification warrantabilityvaultizability, billing webhook warrantabilityvaultizability, and full signal coverage.',
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
        ? 'Production warrantabilityvaultizability rollout checks passed. Warrantabilityvaultizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production warrantabilityvaultizability rollout is not ready. Resolve failed checks before relying on production warrantabilityvaultizability tooling.',
  }
}

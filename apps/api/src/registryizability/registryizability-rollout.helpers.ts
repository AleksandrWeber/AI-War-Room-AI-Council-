import type { ApiEnv } from '../config/env.js'

export const CRITICAL_REGISTRYIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type RegistryizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RegistryizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RegistryizabilityRolloutCheck[]
  guidance: string
}

export type RegistryizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRegistryizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateRegistryizabilityRollout(
  input: RegistryizabilityRolloutInput,
): RegistryizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const registryizabilityTableCoverageComplete =
    input.existingRegistryizabilityTableCount === CRITICAL_REGISTRYIZABILITY_TABLES.length

  const checks: RegistryizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL registryizability checks can reach the database.'
            : 'Production registryizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'registryizability_signal_table_coverage',
      label: 'Registryizability signal table coverage',
      status: registryizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Registryizability signal table coverage is only enforced in production.'
          : registryizabilityTableCoverageComplete
            ? `${input.existingRegistryizabilityTableCount}/${CRITICAL_REGISTRYIZABILITY_TABLES.length} registryizability signal tables are present.`
            : `${input.existingRegistryizabilityTableCount}/${CRITICAL_REGISTRYIZABILITY_TABLES.length} registryizability signal tables were found.`,
    },
    {
      name: 'billing_notification_registryizability',
      label: 'Billing notification registryizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification registryizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification registryizability signals.'
            : 'Production registryizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_registryizability',
      label: 'Billing webhook registryizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook registryizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook registryizability signals.'
            : 'Production registryizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'registryization_readiness_signal',
      label: 'Registryization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          registryizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Registryization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              registryizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support registryization readiness.'
            : 'Production registryizability rollout requires PostgreSQL connectivity, registryizability tables, billing notification registryizability, billing webhook registryizability, and full signal coverage.',
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
        ? 'Production registryizability rollout checks passed. Registryizability coverage and registryization readiness signal signals are healthy.'
        : 'Production registryizability rollout is not ready. Resolve failed checks before relying on production registryizability tooling.',
  }
}

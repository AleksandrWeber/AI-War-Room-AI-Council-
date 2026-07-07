import type { ApiEnv } from '../config/env.js'

export const CRITICAL_MODIFIABILITYVAULTIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type ModifiabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ModifiabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ModifiabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type ModifiabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingModifiabilityvaultizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateModifiabilityvaultizabilityRollout(
  input: ModifiabilityvaultizabilityRolloutInput,
): ModifiabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const modifiabilityvaultizabilityTableCoverageComplete =
    input.existingModifiabilityvaultizabilityTableCount === CRITICAL_MODIFIABILITYVAULTIZABILITY_TABLES.length

  const checks: ModifiabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL modifiabilityvaultizability checks can reach the database.'
            : 'Production modifiabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'modifiabilityvaultizability_signal_table_coverage',
      label: 'Modifiabilityvaultizability signal table coverage',
      status: modifiabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Modifiabilityvaultizability signal table coverage is only enforced in production.'
          : modifiabilityvaultizabilityTableCoverageComplete
            ? `${input.existingModifiabilityvaultizabilityTableCount}/${CRITICAL_MODIFIABILITYVAULTIZABILITY_TABLES.length} modifiabilityvaultizability signal tables are present.`
            : `${input.existingModifiabilityvaultizabilityTableCount}/${CRITICAL_MODIFIABILITYVAULTIZABILITY_TABLES.length} modifiabilityvaultizability signal tables were found.`,
    },
    {
      name: 'billing_notification_modifiabilityvaultizability',
      label: 'Billing notification modifiabilityvaultizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification modifiabilityvaultizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification modifiabilityvaultizability signals.'
            : 'Production modifiabilityvaultizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_modifiabilityvaultizability',
      label: 'Billing webhook modifiabilityvaultizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook modifiabilityvaultizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook modifiabilityvaultizability signals.'
            : 'Production modifiabilityvaultizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          modifiabilityvaultizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              modifiabilityvaultizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production modifiabilityvaultizability rollout requires PostgreSQL connectivity, modifiabilityvaultizability tables, billing notification modifiabilityvaultizability, billing webhook modifiabilityvaultizability, and full signal coverage.',
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
        ? 'Production modifiabilityvaultizability rollout checks passed. Modifiabilityvaultizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production modifiabilityvaultizability rollout is not ready. Resolve failed checks before relying on production modifiabilityvaultizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CREDIBILITYVAULTIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type CredibilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CredibilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CredibilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type CredibilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCredibilityvaultizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateCredibilityvaultizabilityRollout(
  input: CredibilityvaultizabilityRolloutInput,
): CredibilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const credibilityvaultizabilityTableCoverageComplete =
    input.existingCredibilityvaultizabilityTableCount === CRITICAL_CREDIBILITYVAULTIZABILITY_TABLES.length

  const checks: CredibilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL credibilityvaultizability checks can reach the database.'
            : 'Production credibilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'credibilityvaultizability_signal_table_coverage',
      label: 'Credibilityvaultizability signal table coverage',
      status: credibilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Credibilityvaultizability signal table coverage is only enforced in production.'
          : credibilityvaultizabilityTableCoverageComplete
            ? `${input.existingCredibilityvaultizabilityTableCount}/${CRITICAL_CREDIBILITYVAULTIZABILITY_TABLES.length} credibilityvaultizability signal tables are present.`
            : `${input.existingCredibilityvaultizabilityTableCount}/${CRITICAL_CREDIBILITYVAULTIZABILITY_TABLES.length} credibilityvaultizability signal tables were found.`,
    },
    {
      name: 'billing_notification_credibilityvaultizability',
      label: 'Billing notification credibilityvaultizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification credibilityvaultizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification credibilityvaultizability signals.'
            : 'Production credibilityvaultizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_credibilityvaultizability',
      label: 'Billing webhook credibilityvaultizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook credibilityvaultizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook credibilityvaultizability signals.'
            : 'Production credibilityvaultizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          credibilityvaultizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              credibilityvaultizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production credibilityvaultizability rollout requires PostgreSQL connectivity, credibilityvaultizability tables, billing notification credibilityvaultizability, billing webhook credibilityvaultizability, and full signal coverage.',
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
        ? 'Production credibilityvaultizability rollout checks passed. Credibilityvaultizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production credibilityvaultizability rollout is not ready. Resolve failed checks before relying on production credibilityvaultizability tooling.',
  }
}

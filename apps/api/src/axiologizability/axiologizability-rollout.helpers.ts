import type { ApiEnv } from '../config/env.js'

export const CRITICAL_AXIOLOGIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type AxiologizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AxiologizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AxiologizabilityRolloutCheck[]
  guidance: string
}

export type AxiologizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAxiologizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateAxiologizabilityRollout(
  input: AxiologizabilityRolloutInput,
): AxiologizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const axiologizabilityTableCoverageComplete =
    input.existingAxiologizabilityTableCount === CRITICAL_AXIOLOGIZABILITY_TABLES.length

  const checks: AxiologizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL axiologizability checks can reach the database.'
            : 'Production axiologizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'axiologizability_signal_table_coverage',
      label: 'Axiologizability signal table coverage',
      status: axiologizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Axiologizability signal table coverage is only enforced in production.'
          : axiologizabilityTableCoverageComplete
            ? `${input.existingAxiologizabilityTableCount}/${CRITICAL_AXIOLOGIZABILITY_TABLES.length} axiologizability signal tables are present.`
            : `${input.existingAxiologizabilityTableCount}/${CRITICAL_AXIOLOGIZABILITY_TABLES.length} axiologizability signal tables were found.`,
    },
    {
      name: 'billing_notification_axiologizability',
      label: 'Billing notification axiologizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification axiologizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification axiologizability signals.'
            : 'Production axiologizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_axiologizability',
      label: 'Billing webhook axiologizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook axiologizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook axiologizability signals.'
            : 'Production axiologizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'axiologization_readiness_signal',
      label: 'Axiologization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          axiologizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Axiologization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              axiologizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support axiologization readiness.'
            : 'Production axiologizability rollout requires PostgreSQL connectivity, axiologizability tables, billing notification axiologizability, billing webhook axiologizability, and full signal coverage.',
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
        ? 'Production axiologizability rollout checks passed. Axiologizability coverage and axiologization readiness signal signals are healthy.'
        : 'Production axiologizability rollout is not ready. Resolve failed checks before relying on production axiologizability tooling.',
  }
}

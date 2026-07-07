import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ATTESTATIONIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type AttestationizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AttestationizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AttestationizabilityRolloutCheck[]
  guidance: string
}

export type AttestationizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAttestationizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateAttestationizabilityRollout(
  input: AttestationizabilityRolloutInput,
): AttestationizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const attestationizabilityTableCoverageComplete =
    input.existingAttestationizabilityTableCount === CRITICAL_ATTESTATIONIZABILITY_TABLES.length

  const checks: AttestationizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL attestationizability checks can reach the database.'
            : 'Production attestationizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'attestationizability_signal_table_coverage',
      label: 'Attestationizability signal table coverage',
      status: attestationizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Attestationizability signal table coverage is only enforced in production.'
          : attestationizabilityTableCoverageComplete
            ? `${input.existingAttestationizabilityTableCount}/${CRITICAL_ATTESTATIONIZABILITY_TABLES.length} attestationizability signal tables are present.`
            : `${input.existingAttestationizabilityTableCount}/${CRITICAL_ATTESTATIONIZABILITY_TABLES.length} attestationizability signal tables were found.`,
    },
    {
      name: 'billing_notification_attestationizability',
      label: 'Billing notification attestationizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification attestationizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification attestationizability signals.'
            : 'Production attestationizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_attestationizability',
      label: 'Billing webhook attestationizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook attestationizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook attestationizability signals.'
            : 'Production attestationizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          attestationizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              attestationizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production attestationizability rollout requires PostgreSQL connectivity, attestationizability tables, billing notification attestationizability, billing webhook attestationizability, and full signal coverage.',
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
        ? 'Production attestationizability rollout checks passed. Attestationizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production attestationizability rollout is not ready. Resolve failed checks before relying on production attestationizability tooling.',
  }
}

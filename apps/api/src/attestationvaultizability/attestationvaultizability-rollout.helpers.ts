import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ATTESTATIONVAULTIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type AttestationvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AttestationvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AttestationvaultizabilityRolloutCheck[]
  guidance: string
}

export type AttestationvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAttestationvaultizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateAttestationvaultizabilityRollout(
  input: AttestationvaultizabilityRolloutInput,
): AttestationvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const attestationvaultizabilityTableCoverageComplete =
    input.existingAttestationvaultizabilityTableCount === CRITICAL_ATTESTATIONVAULTIZABILITY_TABLES.length

  const checks: AttestationvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL attestationvaultizability checks can reach the database.'
            : 'Production attestationvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'attestationvaultizability_signal_table_coverage',
      label: 'Attestationvaultizability signal table coverage',
      status: attestationvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Attestationvaultizability signal table coverage is only enforced in production.'
          : attestationvaultizabilityTableCoverageComplete
            ? `${input.existingAttestationvaultizabilityTableCount}/${CRITICAL_ATTESTATIONVAULTIZABILITY_TABLES.length} attestationvaultizability signal tables are present.`
            : `${input.existingAttestationvaultizabilityTableCount}/${CRITICAL_ATTESTATIONVAULTIZABILITY_TABLES.length} attestationvaultizability signal tables were found.`,
    },
    {
      name: 'billing_notification_attestationvaultizability',
      label: 'Billing notification attestationvaultizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification attestationvaultizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification attestationvaultizability signals.'
            : 'Production attestationvaultizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_attestationvaultizability',
      label: 'Billing webhook attestationvaultizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook attestationvaultizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook attestationvaultizability signals.'
            : 'Production attestationvaultizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          attestationvaultizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              attestationvaultizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production attestationvaultizability rollout requires PostgreSQL connectivity, attestationvaultizability tables, billing notification attestationvaultizability, billing webhook attestationvaultizability, and full signal coverage.',
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
        ? 'Production attestationvaultizability rollout checks passed. Attestationvaultizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production attestationvaultizability rollout is not ready. Resolve failed checks before relying on production attestationvaultizability tooling.',
  }
}

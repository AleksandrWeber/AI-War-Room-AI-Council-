import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SIGNATUREPROOFIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type SignatureproofizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SignatureproofizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SignatureproofizabilityRolloutCheck[]
  guidance: string
}

export type SignatureproofizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSignatureproofizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateSignatureproofizabilityRollout(
  input: SignatureproofizabilityRolloutInput,
): SignatureproofizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const signatureproofizabilityTableCoverageComplete =
    input.existingSignatureproofizabilityTableCount === CRITICAL_SIGNATUREPROOFIZABILITY_TABLES.length

  const checks: SignatureproofizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL signatureproofizability checks can reach the database.'
            : 'Production signatureproofizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'signatureproofizability_signal_table_coverage',
      label: 'Signatureproofizability signal table coverage',
      status: signatureproofizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Signatureproofizability signal table coverage is only enforced in production.'
          : signatureproofizabilityTableCoverageComplete
            ? `${input.existingSignatureproofizabilityTableCount}/${CRITICAL_SIGNATUREPROOFIZABILITY_TABLES.length} signatureproofizability signal tables are present.`
            : `${input.existingSignatureproofizabilityTableCount}/${CRITICAL_SIGNATUREPROOFIZABILITY_TABLES.length} signatureproofizability signal tables were found.`,
    },
    {
      name: 'billing_notification_signatureproofizability',
      label: 'Billing notification signatureproofizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification signatureproofizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification signatureproofizability signals.'
            : 'Production signatureproofizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_signatureproofizability',
      label: 'Billing webhook signatureproofizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook signatureproofizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook signatureproofizability signals.'
            : 'Production signatureproofizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'governanceization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          signatureproofizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              signatureproofizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support governanceization readiness.'
            : 'Production signatureproofizability rollout requires PostgreSQL connectivity, signatureproofizability tables, billing notification signatureproofizability, billing webhook signatureproofizability, and full signal coverage.',
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
        ? 'Production signatureproofizability rollout checks passed. Signatureproofizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production signatureproofizability rollout is not ready. Resolve failed checks before relying on production signatureproofizability tooling.',
  }
}

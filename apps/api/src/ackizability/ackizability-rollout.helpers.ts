import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ACKIZABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type AckizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AckizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AckizabilityRolloutCheck[]
  guidance: string
}

export type AckizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAckizabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateAckizabilityRollout(
  input: AckizabilityRolloutInput,
): AckizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const ackizabilityTableCoverageComplete =
    input.existingAckizabilityTableCount === CRITICAL_ACKIZABILITY_TABLES.length

  const checks: AckizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL ackizability checks can reach the database.'
            : 'Production ackizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'ackizability_signal_table_coverage',
      label: 'Ackizability signal table coverage',
      status: ackizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Ackizability signal table coverage is only enforced in production.'
          : ackizabilityTableCoverageComplete
            ? `${input.existingAckizabilityTableCount}/${CRITICAL_ACKIZABILITY_TABLES.length} ackizability signal tables are present.`
            : `${input.existingAckizabilityTableCount}/${CRITICAL_ACKIZABILITY_TABLES.length} ackizability signal tables were found.`,
    },
    {
      name: 'billing_webhook_ackizability',
      label: 'Billing webhook ackizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook ackizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook ackizability signals.'
            : 'Production ackizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_ackizability',
      label: 'Billing record ackizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record ackizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record ackizability signals.'
            : 'Production ackizability rollout requires a billing_records table.',
    },
    {
      name: 'ackization_readiness_signal',
      label: 'Virtualization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          ackizabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Virtualization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              ackizabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support interpolation readiness.'
            : 'Production ackizability rollout requires PostgreSQL connectivity, ackizability tables, billing webhook ackizability, billing record ackizability, and full signal coverage.',
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
        ? 'Production ackizability rollout checks passed. Ackizability coverage and virtualization readiness signal signals are healthy.'
        : 'Production ackizability rollout is not ready. Resolve failed checks before relying on production ackizability tooling.',
  }
}

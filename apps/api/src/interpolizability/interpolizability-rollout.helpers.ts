import type { ApiEnv } from '../config/env.js'

export const CRITICAL_INTERPOLIZABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type InterpolizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type InterpolizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: InterpolizabilityRolloutCheck[]
  guidance: string
}

export type InterpolizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingInterpolizabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateInterpolizabilityRollout(
  input: InterpolizabilityRolloutInput,
): InterpolizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const interpolizabilityTableCoverageComplete =
    input.existingInterpolizabilityTableCount === CRITICAL_INTERPOLIZABILITY_TABLES.length

  const checks: InterpolizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL interpolizability checks can reach the database.'
            : 'Production interpolizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'interpolizability_signal_table_coverage',
      label: 'Interpolizability signal table coverage',
      status: interpolizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Interpolizability signal table coverage is only enforced in production.'
          : interpolizabilityTableCoverageComplete
            ? `${input.existingInterpolizabilityTableCount}/${CRITICAL_INTERPOLIZABILITY_TABLES.length} interpolizability signal tables are present.`
            : `${input.existingInterpolizabilityTableCount}/${CRITICAL_INTERPOLIZABILITY_TABLES.length} interpolizability signal tables were found.`,
    },
    {
      name: 'billing_webhook_interpolizability',
      label: 'Billing webhook interpolizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook interpolizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook interpolizability signals.'
            : 'Production interpolizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_interpolizability',
      label: 'Billing record interpolizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record interpolizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record interpolizability signals.'
            : 'Production interpolizability rollout requires a billing_records table.',
    },
    {
      name: 'interpolization_readiness_signal',
      label: 'Interpolization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          interpolizabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Interpolization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              interpolizabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support interpolation readiness.'
            : 'Production interpolizability rollout requires PostgreSQL connectivity, interpolizability tables, billing webhook interpolizability, billing record interpolizability, and full signal coverage.',
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
        ? 'Production interpolizability rollout checks passed. Interpolizability coverage and interpolization readiness signal signals are healthy.'
        : 'Production interpolizability rollout is not ready. Resolve failed checks before relying on production interpolizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_APPROXIMATIZABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type ApproximatizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ApproximatizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ApproximatizabilityRolloutCheck[]
  guidance: string
}

export type ApproximatizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingApproximatizabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateApproximatizabilityRollout(
  input: ApproximatizabilityRolloutInput,
): ApproximatizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const approximatizabilityTableCoverageComplete =
    input.existingApproximatizabilityTableCount === CRITICAL_APPROXIMATIZABILITY_TABLES.length

  const checks: ApproximatizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL approximatizability checks can reach the database.'
            : 'Production approximatizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'approximatizability_signal_table_coverage',
      label: 'Approximatizability signal table coverage',
      status: approximatizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Approximatizability signal table coverage is only enforced in production.'
          : approximatizabilityTableCoverageComplete
            ? `${input.existingApproximatizabilityTableCount}/${CRITICAL_APPROXIMATIZABILITY_TABLES.length} approximatizability signal tables are present.`
            : `${input.existingApproximatizabilityTableCount}/${CRITICAL_APPROXIMATIZABILITY_TABLES.length} approximatizability signal tables were found.`,
    },
    {
      name: 'billing_webhook_approximatizability',
      label: 'Billing webhook approximatizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook approximatizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook approximatizability signals.'
            : 'Production approximatizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_approximatizability',
      label: 'Billing record approximatizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record approximatizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record approximatizability signals.'
            : 'Production approximatizability rollout requires a billing_records table.',
    },
    {
      name: 'approximatization_readiness_signal',
      label: 'Approximatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          approximatizabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Approximatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              approximatizabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support interpolation readiness.'
            : 'Production approximatizability rollout requires PostgreSQL connectivity, approximatizability tables, billing webhook approximatizability, billing record approximatizability, and full signal coverage.',
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
        ? 'Production approximatizability rollout checks passed. Approximatizability coverage and approximatization readiness signal signals are healthy.'
        : 'Production approximatizability rollout is not ready. Resolve failed checks before relying on production approximatizability tooling.',
  }
}

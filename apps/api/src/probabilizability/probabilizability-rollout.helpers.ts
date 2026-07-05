import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PROBABILIZABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type ProbabilizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ProbabilizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ProbabilizabilityRolloutCheck[]
  guidance: string
}

export type ProbabilizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingProbabilizabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateProbabilizabilityRollout(
  input: ProbabilizabilityRolloutInput,
): ProbabilizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const probabilizabilityTableCoverageComplete =
    input.existingProbabilizabilityTableCount === CRITICAL_PROBABILIZABILITY_TABLES.length

  const checks: ProbabilizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL probabilizability checks can reach the database.'
            : 'Production probabilizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'probabilizability_signal_table_coverage',
      label: 'Probabilizability signal table coverage',
      status: probabilizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Probabilizability signal table coverage is only enforced in production.'
          : probabilizabilityTableCoverageComplete
            ? `${input.existingProbabilizabilityTableCount}/${CRITICAL_PROBABILIZABILITY_TABLES.length} probabilizability signal tables are present.`
            : `${input.existingProbabilizabilityTableCount}/${CRITICAL_PROBABILIZABILITY_TABLES.length} probabilizability signal tables were found.`,
    },
    {
      name: 'billing_webhook_probabilizability',
      label: 'Billing webhook probabilizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook probabilizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook probabilizability signals.'
            : 'Production probabilizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_probabilizability',
      label: 'Billing record probabilizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record probabilizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record probabilizability signals.'
            : 'Production probabilizability rollout requires a billing_records table.',
    },
    {
      name: 'probabilization_readiness_signal',
      label: 'Probabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          probabilizabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Probabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              probabilizabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support probabilization readiness.'
            : 'Production probabilizability rollout requires PostgreSQL connectivity, probabilizability tables, billing webhook probabilizability, billing record probabilizability, and full signal coverage.',
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
        ? 'Production probabilizability rollout checks passed. Probabilizability coverage and probabilization readiness signal signals are healthy.'
        : 'Production probabilizability rollout is not ready. Resolve failed checks before relying on production probabilizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SYSTEMATIZABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type SystematizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SystematizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SystematizabilityRolloutCheck[]
  guidance: string
}

export type SystematizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSystematizabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateSystematizabilityRollout(
  input: SystematizabilityRolloutInput,
): SystematizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const systematizabilityTableCoverageComplete =
    input.existingSystematizabilityTableCount === CRITICAL_SYSTEMATIZABILITY_TABLES.length

  const checks: SystematizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL systematizability checks can reach the database.'
            : 'Production systematizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'systematizability_signal_table_coverage',
      label: 'Systematizability signal table coverage',
      status: systematizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Systematizability signal table coverage is only enforced in production.'
          : systematizabilityTableCoverageComplete
            ? `${input.existingSystematizabilityTableCount}/${CRITICAL_SYSTEMATIZABILITY_TABLES.length} systematizability signal tables are present.`
            : `${input.existingSystematizabilityTableCount}/${CRITICAL_SYSTEMATIZABILITY_TABLES.length} systematizability signal tables were found.`,
    },
    {
      name: 'billing_webhook_systematizability',
      label: 'Billing webhook systematizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook systematizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook systematizability signals.'
            : 'Production systematizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_systematizability',
      label: 'Billing record systematizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record systematizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record systematizability signals.'
            : 'Production systematizability rollout requires a billing_records table.',
    },
    {
      name: 'systematization_readiness_signal',
      label: 'Systematization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          systematizabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Systematization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              systematizabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support systematization readiness.'
            : 'Production systematizability rollout requires PostgreSQL connectivity, systematizability tables, billing webhook systematizability, billing record systematizability, and full signal coverage.',
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
        ? 'Production systematizability rollout checks passed. Systematizability coverage and systematization readiness signal signals are healthy.'
        : 'Production systematizability rollout is not ready. Resolve failed checks before relying on production systematizability tooling.',
  }
}

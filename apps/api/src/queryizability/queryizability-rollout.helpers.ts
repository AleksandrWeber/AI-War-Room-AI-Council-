import type { ApiEnv } from '../config/env.js'

export const CRITICAL_QUERYIZABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type QueryizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type QueryizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: QueryizabilityRolloutCheck[]
  guidance: string
}

export type QueryizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingQueryizabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateQueryizabilityRollout(
  input: QueryizabilityRolloutInput,
): QueryizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const queryizabilityTableCoverageComplete =
    input.existingQueryizabilityTableCount === CRITICAL_QUERYIZABILITY_TABLES.length

  const checks: QueryizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL queryizability checks can reach the database.'
            : 'Production queryizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'queryizability_signal_table_coverage',
      label: 'Queryizability signal table coverage',
      status: queryizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Queryizability signal table coverage is only enforced in production.'
          : queryizabilityTableCoverageComplete
            ? `${input.existingQueryizabilityTableCount}/${CRITICAL_QUERYIZABILITY_TABLES.length} queryizability signal tables are present.`
            : `${input.existingQueryizabilityTableCount}/${CRITICAL_QUERYIZABILITY_TABLES.length} queryizability signal tables were found.`,
    },
    {
      name: 'billing_webhook_queryizability',
      label: 'Billing webhook queryizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook queryizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook queryizability signals.'
            : 'Production queryizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_queryizability',
      label: 'Billing record queryizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record queryizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record queryizability signals.'
            : 'Production queryizability rollout requires a billing_records table.',
    },
    {
      name: 'queryization_readiness_signal',
      label: 'Virtualization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          queryizabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Virtualization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              queryizabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support interpolation readiness.'
            : 'Production queryizability rollout requires PostgreSQL connectivity, queryizability tables, billing webhook queryizability, billing record queryizability, and full signal coverage.',
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
        ? 'Production queryizability rollout checks passed. Queryizability coverage and virtualization readiness signal signals are healthy.'
        : 'Production queryizability rollout is not ready. Resolve failed checks before relying on production queryizability tooling.',
  }
}

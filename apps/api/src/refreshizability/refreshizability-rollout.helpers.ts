import type { ApiEnv } from '../config/env.js'

export const CRITICAL_REFRESHIZABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type RefreshizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RefreshizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RefreshizabilityRolloutCheck[]
  guidance: string
}

export type RefreshizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRefreshizabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateRefreshizabilityRollout(
  input: RefreshizabilityRolloutInput,
): RefreshizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const refreshizabilityTableCoverageComplete =
    input.existingRefreshizabilityTableCount === CRITICAL_REFRESHIZABILITY_TABLES.length

  const checks: RefreshizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL refreshizability checks can reach the database.'
            : 'Production refreshizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'refreshizability_signal_table_coverage',
      label: 'Refreshizability signal table coverage',
      status: refreshizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Refreshizability signal table coverage is only enforced in production.'
          : refreshizabilityTableCoverageComplete
            ? `${input.existingRefreshizabilityTableCount}/${CRITICAL_REFRESHIZABILITY_TABLES.length} refreshizability signal tables are present.`
            : `${input.existingRefreshizabilityTableCount}/${CRITICAL_REFRESHIZABILITY_TABLES.length} refreshizability signal tables were found.`,
    },
    {
      name: 'billing_webhook_refreshizability',
      label: 'Billing webhook refreshizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook refreshizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook refreshizability signals.'
            : 'Production refreshizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_refreshizability',
      label: 'Billing record refreshizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record refreshizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record refreshizability signals.'
            : 'Production refreshizability rollout requires a billing_records table.',
    },
    {
      name: 'refreshization_readiness_signal',
      label: 'Virtualization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          refreshizabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Virtualization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              refreshizabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support interpolation readiness.'
            : 'Production refreshizability rollout requires PostgreSQL connectivity, refreshizability tables, billing webhook refreshizability, billing record refreshizability, and full signal coverage.',
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
        ? 'Production refreshizability rollout checks passed. Refreshizability coverage and virtualization readiness signal signals are healthy.'
        : 'Production refreshizability rollout is not ready. Resolve failed checks before relying on production refreshizability tooling.',
  }
}

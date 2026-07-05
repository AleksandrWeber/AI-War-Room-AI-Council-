import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TOPOLOGIZABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type TopologizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TopologizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TopologizabilityRolloutCheck[]
  guidance: string
}

export type TopologizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTopologizabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateTopologizabilityRollout(
  input: TopologizabilityRolloutInput,
): TopologizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const topologizabilityTableCoverageComplete =
    input.existingTopologizabilityTableCount === CRITICAL_TOPOLOGIZABILITY_TABLES.length

  const checks: TopologizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL topologizability checks can reach the database.'
            : 'Production topologizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'topologizability_signal_table_coverage',
      label: 'Topologizability signal table coverage',
      status: topologizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Topologizability signal table coverage is only enforced in production.'
          : topologizabilityTableCoverageComplete
            ? `${input.existingTopologizabilityTableCount}/${CRITICAL_TOPOLOGIZABILITY_TABLES.length} topologizability signal tables are present.`
            : `${input.existingTopologizabilityTableCount}/${CRITICAL_TOPOLOGIZABILITY_TABLES.length} topologizability signal tables were found.`,
    },
    {
      name: 'billing_webhook_topologizability',
      label: 'Billing webhook topologizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook topologizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook topologizability signals.'
            : 'Production topologizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_topologizability',
      label: 'Billing record topologizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record topologizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record topologizability signals.'
            : 'Production topologizability rollout requires a billing_records table.',
    },
    {
      name: 'topologization_readiness_signal',
      label: 'Virtualization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          topologizabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Virtualization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              topologizabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support interpolation readiness.'
            : 'Production topologizability rollout requires PostgreSQL connectivity, topologizability tables, billing webhook topologizability, billing record topologizability, and full signal coverage.',
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
        ? 'Production topologizability rollout checks passed. Topologizability coverage and virtualization readiness signal signals are healthy.'
        : 'Production topologizability rollout is not ready. Resolve failed checks before relying on production topologizability tooling.',
  }
}

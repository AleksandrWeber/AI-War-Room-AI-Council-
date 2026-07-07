import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DISCOVERYIZABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type DiscoveryizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DiscoveryizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DiscoveryizabilityRolloutCheck[]
  guidance: string
}

export type DiscoveryizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDiscoveryizabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateDiscoveryizabilityRollout(
  input: DiscoveryizabilityRolloutInput,
): DiscoveryizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const discoveryizabilityTableCoverageComplete =
    input.existingDiscoveryizabilityTableCount === CRITICAL_DISCOVERYIZABILITY_TABLES.length

  const checks: DiscoveryizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL discoveryizability checks can reach the database.'
            : 'Production discoveryizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'discoveryizability_signal_table_coverage',
      label: 'Discoveryizability signal table coverage',
      status: discoveryizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Discoveryizability signal table coverage is only enforced in production.'
          : discoveryizabilityTableCoverageComplete
            ? `${input.existingDiscoveryizabilityTableCount}/${CRITICAL_DISCOVERYIZABILITY_TABLES.length} discoveryizability signal tables are present.`
            : `${input.existingDiscoveryizabilityTableCount}/${CRITICAL_DISCOVERYIZABILITY_TABLES.length} discoveryizability signal tables were found.`,
    },
    {
      name: 'billing_webhook_discoveryizability',
      label: 'Billing webhook discoveryizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook discoveryizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook discoveryizability signals.'
            : 'Production discoveryizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_discoveryizability',
      label: 'Billing record discoveryizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record discoveryizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record discoveryizability signals.'
            : 'Production discoveryizability rollout requires a billing_records table.',
    },
    {
      name: 'discoveryization_readiness_signal',
      label: 'Virtualization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          discoveryizabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Virtualization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              discoveryizabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support interpolation readiness.'
            : 'Production discoveryizability rollout requires PostgreSQL connectivity, discoveryizability tables, billing webhook discoveryizability, billing record discoveryizability, and full signal coverage.',
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
        ? 'Production discoveryizability rollout checks passed. Discoveryizability coverage and virtualization readiness signal signals are healthy.'
        : 'Production discoveryizability rollout is not ready. Resolve failed checks before relying on production discoveryizability tooling.',
  }
}

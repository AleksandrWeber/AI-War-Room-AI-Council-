import type { ApiEnv } from '../config/env.js'

export const CRITICAL_REPLICATIONIZABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type ReplicationizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ReplicationizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ReplicationizabilityRolloutCheck[]
  guidance: string
}

export type ReplicationizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingReplicationizabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateReplicationizabilityRollout(
  input: ReplicationizabilityRolloutInput,
): ReplicationizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const replicationizabilityTableCoverageComplete =
    input.existingReplicationizabilityTableCount === CRITICAL_REPLICATIONIZABILITY_TABLES.length

  const checks: ReplicationizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL replicationizability checks can reach the database.'
            : 'Production replicationizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'replicationizability_signal_table_coverage',
      label: 'Replicationizability signal table coverage',
      status: replicationizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Replicationizability signal table coverage is only enforced in production.'
          : replicationizabilityTableCoverageComplete
            ? `${input.existingReplicationizabilityTableCount}/${CRITICAL_REPLICATIONIZABILITY_TABLES.length} replicationizability signal tables are present.`
            : `${input.existingReplicationizabilityTableCount}/${CRITICAL_REPLICATIONIZABILITY_TABLES.length} replicationizability signal tables were found.`,
    },
    {
      name: 'billing_webhook_replicationizability',
      label: 'Billing webhook replicationizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook replicationizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook replicationizability signals.'
            : 'Production replicationizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_replicationizability',
      label: 'Billing record replicationizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record replicationizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record replicationizability signals.'
            : 'Production replicationizability rollout requires a billing_records table.',
    },
    {
      name: 'replicationization_readiness_signal',
      label: 'Virtualization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          replicationizabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Virtualization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              replicationizabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support interpolation readiness.'
            : 'Production replicationizability rollout requires PostgreSQL connectivity, replicationizability tables, billing webhook replicationizability, billing record replicationizability, and full signal coverage.',
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
        ? 'Production replicationizability rollout checks passed. Replicationizability coverage and virtualization readiness signal signals are healthy.'
        : 'Production replicationizability rollout is not ready. Resolve failed checks before relying on production replicationizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_REPLICABILIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type ReplicabilizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ReplicabilizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ReplicabilizabilityRolloutCheck[]
  guidance: string
}

export type ReplicabilizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingReplicabilizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateReplicabilizabilityRollout(
  input: ReplicabilizabilityRolloutInput,
): ReplicabilizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const replicabilizabilityTableCoverageComplete =
    input.existingReplicabilizabilityTableCount === CRITICAL_REPLICABILIZABILITY_TABLES.length

  const checks: ReplicabilizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL replicabilizability checks can reach the database.'
            : 'Production replicabilizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'replicabilizability_signal_table_coverage',
      label: 'Replicabilizability signal table coverage',
      status: replicabilizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Replicabilizability signal table coverage is only enforced in production.'
          : replicabilizabilityTableCoverageComplete
            ? `${input.existingReplicabilizabilityTableCount}/${CRITICAL_REPLICABILIZABILITY_TABLES.length} replicabilizability signal tables are present.`
            : `${input.existingReplicabilizabilityTableCount}/${CRITICAL_REPLICABILIZABILITY_TABLES.length} replicabilizability signal tables were found.`,
    },
    {
      name: 'meter_usage_replicabilizability',
      label: 'Meter usage replicabilizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage replicabilizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage replicabilizability signals.'
            : 'Production replicabilizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_replicabilizability',
      label: 'Usage event replicabilizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event replicabilizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event replicabilizability signals.'
            : 'Production replicabilizability rollout requires a usage_events table.',
    },
    {
      name: 'replicabilization_readiness_signal',
      label: 'Replicabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          replicabilizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Replicabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              replicabilizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support replicabilization readiness.'
            : 'Production replicabilizability rollout requires PostgreSQL connectivity, replicabilizability tables, meter usage replicabilizability, usage event replicabilizability, and full signal coverage.',
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
        ? 'Production replicabilizability rollout checks passed. Replicabilizability coverage and replicabilization readiness signal signals are healthy.'
        : 'Production replicabilizability rollout is not ready. Resolve failed checks before relying on production replicabilizability tooling.',
  }
}

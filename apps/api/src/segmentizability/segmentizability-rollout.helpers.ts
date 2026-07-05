import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SEGMENTIZABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type SegmentizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SegmentizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SegmentizabilityRolloutCheck[]
  guidance: string
}

export type SegmentizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSegmentizabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateSegmentizabilityRollout(
  input: SegmentizabilityRolloutInput,
): SegmentizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const segmentizabilityTableCoverageComplete =
    input.existingSegmentizabilityTableCount === CRITICAL_SEGMENTIZABILITY_TABLES.length

  const checks: SegmentizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL segmentizability checks can reach the database.'
            : 'Production segmentizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'segmentizability_signal_table_coverage',
      label: 'Segmentizability signal table coverage',
      status: segmentizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Segmentizability signal table coverage is only enforced in production.'
          : segmentizabilityTableCoverageComplete
            ? `${input.existingSegmentizabilityTableCount}/${CRITICAL_SEGMENTIZABILITY_TABLES.length} segmentizability signal tables are present.`
            : `${input.existingSegmentizabilityTableCount}/${CRITICAL_SEGMENTIZABILITY_TABLES.length} segmentizability signal tables were found.`,
    },
    {
      name: 'workspace_limit_segmentizability',
      label: 'Workspace limit segmentizability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit segmentizability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit segmentizability signals.'
            : 'Production segmentizability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_segmentizability',
      label: 'Usage event segmentizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event segmentizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event segmentizability signals.'
            : 'Production segmentizability rollout requires a usage_events table.',
    },
    {
      name: 'segmentization_readiness_signal',
      label: 'Segmentization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          segmentizabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Segmentization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              segmentizabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support segmentization readiness.'
            : 'Production segmentizability rollout requires PostgreSQL connectivity, segmentizability tables, workspace limit segmentizability, usage event segmentizability, and full signal coverage.',
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
        ? 'Production segmentizability rollout checks passed. Segmentizability coverage and segmentization readiness signal signals are healthy.'
        : 'Production segmentizability rollout is not ready. Resolve failed checks before relying on production segmentizability tooling.',
  }
}

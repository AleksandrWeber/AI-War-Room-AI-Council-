import type { ApiEnv } from '../config/env.js'

export const CRITICAL_MORPHIZABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type MorphizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type MorphizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: MorphizabilityRolloutCheck[]
  guidance: string
}

export type MorphizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingMorphizabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateMorphizabilityRollout(
  input: MorphizabilityRolloutInput,
): MorphizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const morphizabilityTableCoverageComplete =
    input.existingMorphizabilityTableCount === CRITICAL_MORPHIZABILITY_TABLES.length

  const checks: MorphizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL morphizability checks can reach the database.'
            : 'Production morphizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'morphizability_signal_table_coverage',
      label: 'Morphizability signal table coverage',
      status: morphizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Morphizability signal table coverage is only enforced in production.'
          : morphizabilityTableCoverageComplete
            ? `${input.existingMorphizabilityTableCount}/${CRITICAL_MORPHIZABILITY_TABLES.length} morphizability signal tables are present.`
            : `${input.existingMorphizabilityTableCount}/${CRITICAL_MORPHIZABILITY_TABLES.length} morphizability signal tables were found.`,
    },
    {
      name: 'workspace_limit_morphizability',
      label: 'Workspace limit morphizability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit morphizability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit morphizability signals.'
            : 'Production morphizability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_morphizability',
      label: 'Usage event morphizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event morphizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event morphizability signals.'
            : 'Production morphizability rollout requires a usage_events table.',
    },
    {
      name: 'morphization_readiness_signal',
      label: 'Morphization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          morphizabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Morphization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              morphizabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support morphization readiness.'
            : 'Production morphizability rollout requires PostgreSQL connectivity, morphizability tables, workspace limit morphizability, usage event morphizability, and full signal coverage.',
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
        ? 'Production morphizability rollout checks passed. Morphizability coverage and morphization readiness signal signals are healthy.'
        : 'Production morphizability rollout is not ready. Resolve failed checks before relying on production morphizability tooling.',
  }
}

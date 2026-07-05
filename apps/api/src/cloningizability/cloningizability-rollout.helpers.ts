import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CLONINGIZABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type CloningizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CloningizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CloningizabilityRolloutCheck[]
  guidance: string
}

export type CloningizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCloningizabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateCloningizabilityRollout(
  input: CloningizabilityRolloutInput,
): CloningizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const cloningizabilityTableCoverageComplete =
    input.existingCloningizabilityTableCount === CRITICAL_CLONINGIZABILITY_TABLES.length

  const checks: CloningizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL cloningizability checks can reach the database.'
            : 'Production cloningizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'cloningizability_signal_table_coverage',
      label: 'Cloningizability signal table coverage',
      status: cloningizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Cloningizability signal table coverage is only enforced in production.'
          : cloningizabilityTableCoverageComplete
            ? `${input.existingCloningizabilityTableCount}/${CRITICAL_CLONINGIZABILITY_TABLES.length} cloningizability signal tables are present.`
            : `${input.existingCloningizabilityTableCount}/${CRITICAL_CLONINGIZABILITY_TABLES.length} cloningizability signal tables were found.`,
    },
    {
      name: 'workspace_limit_cloningizability',
      label: 'Workspace limit cloningizability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit cloningizability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit cloningizability signals.'
            : 'Production cloningizability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_cloningizability',
      label: 'Usage event cloningizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event cloningizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event cloningizability signals.'
            : 'Production cloningizability rollout requires a usage_events table.',
    },
    {
      name: 'cloningization_readiness_signal',
      label: 'Federatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          cloningizabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Federatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              cloningizabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support cloningization readiness.'
            : 'Production cloningizability rollout requires PostgreSQL connectivity, cloningizability tables, workspace limit cloningizability, usage event cloningizability, and full signal coverage.',
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
        ? 'Production cloningizability rollout checks passed. Cloningizability coverage and federatization readiness signal signals are healthy.'
        : 'Production cloningizability rollout is not ready. Resolve failed checks before relying on production cloningizability tooling.',
  }
}

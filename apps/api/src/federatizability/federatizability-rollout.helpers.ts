import type { ApiEnv } from '../config/env.js'

export const CRITICAL_FEDERATIZABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type FederatizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type FederatizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: FederatizabilityRolloutCheck[]
  guidance: string
}

export type FederatizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingFederatizabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateFederatizabilityRollout(
  input: FederatizabilityRolloutInput,
): FederatizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const federatizabilityTableCoverageComplete =
    input.existingFederatizabilityTableCount === CRITICAL_FEDERATIZABILITY_TABLES.length

  const checks: FederatizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL federatizability checks can reach the database.'
            : 'Production federatizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'federatizability_signal_table_coverage',
      label: 'Federatizability signal table coverage',
      status: federatizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Federatizability signal table coverage is only enforced in production.'
          : federatizabilityTableCoverageComplete
            ? `${input.existingFederatizabilityTableCount}/${CRITICAL_FEDERATIZABILITY_TABLES.length} federatizability signal tables are present.`
            : `${input.existingFederatizabilityTableCount}/${CRITICAL_FEDERATIZABILITY_TABLES.length} federatizability signal tables were found.`,
    },
    {
      name: 'workspace_limit_federatizability',
      label: 'Workspace limit federatizability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit federatizability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit federatizability signals.'
            : 'Production federatizability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_federatizability',
      label: 'Usage event federatizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event federatizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event federatizability signals.'
            : 'Production federatizability rollout requires a usage_events table.',
    },
    {
      name: 'federatization_readiness_signal',
      label: 'Federatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          federatizabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Federatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              federatizabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support federatization readiness.'
            : 'Production federatizability rollout requires PostgreSQL connectivity, federatizability tables, workspace limit federatizability, usage event federatizability, and full signal coverage.',
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
        ? 'Production federatizability rollout checks passed. Federatizability coverage and federatization readiness signal signals are healthy.'
        : 'Production federatizability rollout is not ready. Resolve failed checks before relying on production federatizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_FEASIBILITY_TABLES = [
  'workspace_provider_credentials',
  'usage_events',
  'billing_meter_usage_reports',
] as const

export type FeasibilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type FeasibilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: FeasibilityRolloutCheck[]
  guidance: string
}

export type FeasibilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingFeasibilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  usageEventsTableExists: boolean
  billingMeterUsageReportsTableExists: boolean
}

export function evaluateFeasibilityRollout(
  input: FeasibilityRolloutInput,
): FeasibilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const feasibilityTableCoverageComplete =
    input.existingFeasibilityTableCount === CRITICAL_FEASIBILITY_TABLES.length

  const checks: FeasibilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL feasibility checks can reach the database.'
            : 'Production feasibility rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'feasibility_signal_table_coverage',
      label: 'Feasibility signal table coverage',
      status: feasibilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Feasibility signal table coverage is only enforced in production.'
          : feasibilityTableCoverageComplete
            ? `${input.existingFeasibilityTableCount}/${CRITICAL_FEASIBILITY_TABLES.length} feasibility signal tables are present.`
            : `${input.existingFeasibilityTableCount}/${CRITICAL_FEASIBILITY_TABLES.length} feasibility signal tables were found.`,
    },
    {
      name: 'provider_credential_feasibility',
      label: 'Provider credential feasibility',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential feasibility is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential feasibility signals.'
            : 'Production feasibility rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'usage_event_feasibility',
      label: 'Usage event feasibility',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event feasibility is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event feasibility signals.'
            : 'Production feasibility rollout requires a usage_events table.',
    },
    {
      name: 'feasibility_readiness_signal',
      label: 'Feasibility readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          feasibilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.usageEventsTableExists &&
          input.billingMeterUsageReportsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Feasibility readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              feasibilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.usageEventsTableExists &&
              input.billingMeterUsageReportsTableExists
            ? 'Provider credentials, usage events, and meter usage reports support feasibility readiness.'
            : 'Production feasibility rollout requires PostgreSQL connectivity, feasibility tables, provider credential feasibility, usage event feasibility, and full signal coverage.',
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
        ? 'Production feasibility rollout checks passed. Feasibility coverage and feasibility readiness signal signals are healthy.'
        : 'Production feasibility rollout is not ready. Resolve failed checks before relying on production feasibility tooling.',
  }
}

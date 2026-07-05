import type { ApiEnv } from '../config/env.js'

export const CRITICAL_LOCATABILITY_TABLES = [
  'workspace_provider_credentials',
  'workspace_usage_limits',
  'usage_events',
] as const

export type LocatabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type LocatabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: LocatabilityRolloutCheck[]
  guidance: string
}

export type LocatabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingLocatabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateLocatabilityRollout(
  input: LocatabilityRolloutInput,
): LocatabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const locatabilityTableCoverageComplete =
    input.existingLocatabilityTableCount === CRITICAL_LOCATABILITY_TABLES.length

  const checks: LocatabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL locatability checks can reach the database.'
            : 'Production locatability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'locatability_signal_table_coverage',
      label: 'Locatability signal table coverage',
      status: locatabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Locatability signal table coverage is only enforced in production.'
          : locatabilityTableCoverageComplete
            ? `${input.existingLocatabilityTableCount}/${CRITICAL_LOCATABILITY_TABLES.length} locatability signal tables are present.`
            : `${input.existingLocatabilityTableCount}/${CRITICAL_LOCATABILITY_TABLES.length} locatability signal tables were found.`,
    },
    {
      name: 'provider_credential_locatability',
      label: 'Provider credential locatability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential locatability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential locatability signals.'
            : 'Production locatability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'workspace_limit_locatability',
      label: 'Workspace limit locatability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit locatability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit locatability signals.'
            : 'Production locatability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'location_readiness_signal',
      label: 'Location readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          locatabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Location readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              locatabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists
            ? 'Workspace provider credentials, usage limits, and usage events support location readiness.'
            : 'Production locatability rollout requires PostgreSQL connectivity, locatability tables, provider credential locatability, workspace limit locatability, and full signal coverage.',
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
        ? 'Production locatability rollout checks passed. Locatability coverage and location readiness signal signals are healthy.'
        : 'Production locatability rollout is not ready. Resolve failed checks before relying on production locatability tooling.',
  }
}

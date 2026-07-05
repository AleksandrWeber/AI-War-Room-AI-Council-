import type { ApiEnv } from '../config/env.js'

export const CRITICAL_COMPATIBILITY_TABLES = [
  'workspace_provider_credentials',
  'workspace_usage_limits',
  'billing_records',
] as const

export type CompatibilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CompatibilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CompatibilityRolloutCheck[]
  guidance: string
}

export type CompatibilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCompatibilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateCompatibilityRollout(
  input: CompatibilityRolloutInput,
): CompatibilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const compatibilityTableCoverageComplete =
    input.existingCompatibilityTableCount === CRITICAL_COMPATIBILITY_TABLES.length

  const checks: CompatibilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL compatibility checks can reach the database.'
            : 'Production compatibility rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'compatibility_signal_table_coverage',
      label: 'Compatibility signal table coverage',
      status: compatibilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Compatibility signal table coverage is only enforced in production.'
          : compatibilityTableCoverageComplete
            ? `${input.existingCompatibilityTableCount}/${CRITICAL_COMPATIBILITY_TABLES.length} compatibility signal tables are present.`
            : `${input.existingCompatibilityTableCount}/${CRITICAL_COMPATIBILITY_TABLES.length} compatibility signal tables were found.`,
    },
    {
      name: 'provider_credential_compatibility',
      label: 'Provider credential compatibility',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential compatibility is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential compatibility signals.'
            : 'Production compatibility rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'workspace_limit_compatibility',
      label: 'Workspace limit compatibility',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit compatibility is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit compatibility signals.'
            : 'Production compatibility rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'compatibility_readiness_signal',
      label: 'Compatibility readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          compatibilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.workspaceUsageLimitsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Compatibility readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              compatibilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.workspaceUsageLimitsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace provider credentials, usage limits, and billing records support compatibility readiness.'
            : 'Production compatibility rollout requires PostgreSQL connectivity, compatibility tables, provider credential compatibility, workspace limit compatibility, and full signal coverage.',
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
        ? 'Production compatibility rollout checks passed. Compatibility coverage and compatibility readiness signal signals are healthy.'
        : 'Production compatibility rollout is not ready. Resolve failed checks before relying on production compatibility tooling.',
  }
}

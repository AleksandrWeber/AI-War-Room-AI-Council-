import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CONFIGURABILITY_TABLES = [
  'workspace_provider_credentials',
  'workspace_usage_limits',
  'billing_meter_usage_reports',
] as const

export type ConfigurabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ConfigurabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ConfigurabilityRolloutCheck[]
  guidance: string
}

export type ConfigurabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingConfigurabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
  billingMeterUsageReportsTableExists: boolean
}

export function evaluateConfigurabilityRollout(
  input: ConfigurabilityRolloutInput,
): ConfigurabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const configurabilityTableCoverageComplete =
    input.existingConfigurabilityTableCount === CRITICAL_CONFIGURABILITY_TABLES.length

  const checks: ConfigurabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL configurability checks can reach the database.'
            : 'Production configurability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'configurability_signal_table_coverage',
      label: 'Configurability signal table coverage',
      status: configurabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Configurability signal table coverage is only enforced in production.'
          : configurabilityTableCoverageComplete
            ? `${input.existingConfigurabilityTableCount}/${CRITICAL_CONFIGURABILITY_TABLES.length} configurability signal tables are present.`
            : `${input.existingConfigurabilityTableCount}/${CRITICAL_CONFIGURABILITY_TABLES.length} configurability signal tables were found.`,
    },
    {
      name: 'provider_credential_configurability',
      label: 'Provider credential configurability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential configurability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential configurability signals.'
            : 'Production configurability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'workspace_limit_configurability',
      label: 'Workspace limit configurability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit configurability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit configurability signals.'
            : 'Production configurability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'configuration_readiness_signal',
      label: 'Configuration readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          configurabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.workspaceUsageLimitsTableExists &&
          input.billingMeterUsageReportsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Configuration readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              configurabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.workspaceUsageLimitsTableExists &&
              input.billingMeterUsageReportsTableExists
            ? 'Workspace provider credentials, usage limits, and meter usage reports support configuration readiness.'
            : 'Production configurability rollout requires PostgreSQL connectivity, configurability tables, provider credential configurability, workspace limit configurability, and full signal coverage.',
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
        ? 'Production configurability rollout checks passed. Configurability coverage and configuration readiness signal signals are healthy.'
        : 'Production configurability rollout is not ready. Resolve failed checks before relying on production configurability tooling.',
  }
}

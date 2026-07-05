import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CONFIGURABILIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type ConfigurabilizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ConfigurabilizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ConfigurabilizabilityRolloutCheck[]
  guidance: string
}

export type ConfigurabilizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingConfigurabilizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateConfigurabilizabilityRollout(
  input: ConfigurabilizabilityRolloutInput,
): ConfigurabilizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const configurabilizabilityTableCoverageComplete =
    input.existingConfigurabilizabilityTableCount === CRITICAL_CONFIGURABILIZABILITY_TABLES.length

  const checks: ConfigurabilizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL configurabilizability checks can reach the database.'
            : 'Production configurabilizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'configurabilizability_signal_table_coverage',
      label: 'Configurabilizability signal table coverage',
      status: configurabilizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Configurabilizability signal table coverage is only enforced in production.'
          : configurabilizabilityTableCoverageComplete
            ? `${input.existingConfigurabilizabilityTableCount}/${CRITICAL_CONFIGURABILIZABILITY_TABLES.length} configurabilizability signal tables are present.`
            : `${input.existingConfigurabilizabilityTableCount}/${CRITICAL_CONFIGURABILIZABILITY_TABLES.length} configurabilizability signal tables were found.`,
    },
    {
      name: 'shield_scan_configurabilizability',
      label: 'Shield scan configurabilizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan configurabilizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan configurabilizability signals.'
            : 'Production configurabilizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_configurabilizability',
      label: 'Provider credential configurabilizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential configurabilizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential configurabilizability signals.'
            : 'Production configurabilizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'configurabilization_readiness_signal',
      label: 'Configurabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          configurabilizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Configurabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              configurabilizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support configurabilization readiness.'
            : 'Production configurabilizability rollout requires PostgreSQL connectivity, configurabilizability tables, shield scan configurabilizability, provider credential configurabilizability, and full signal coverage.',
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
        ? 'Production configurabilizability rollout checks passed. Configurabilizability coverage and configurabilization readiness signal signals are healthy.'
        : 'Production configurabilizability rollout is not ready. Resolve failed checks before relying on production configurabilizability tooling.',
  }
}

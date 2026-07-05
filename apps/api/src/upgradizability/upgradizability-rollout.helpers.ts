import type { ApiEnv } from '../config/env.js'

export const CRITICAL_UPGRADIZABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type UpgradizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type UpgradizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: UpgradizabilityRolloutCheck[]
  guidance: string
}

export type UpgradizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingUpgradizabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateUpgradizabilityRollout(
  input: UpgradizabilityRolloutInput,
): UpgradizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const upgradizabilityTableCoverageComplete =
    input.existingUpgradizabilityTableCount === CRITICAL_UPGRADIZABILITY_TABLES.length

  const checks: UpgradizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL upgradizability checks can reach the database.'
            : 'Production upgradizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'upgradizability_signal_table_coverage',
      label: 'Upgradizability signal table coverage',
      status: upgradizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Upgradizability signal table coverage is only enforced in production.'
          : upgradizabilityTableCoverageComplete
            ? `${input.existingUpgradizabilityTableCount}/${CRITICAL_UPGRADIZABILITY_TABLES.length} upgradizability signal tables are present.`
            : `${input.existingUpgradizabilityTableCount}/${CRITICAL_UPGRADIZABILITY_TABLES.length} upgradizability signal tables were found.`,
    },
    {
      name: 'provider_credential_upgradizability',
      label: 'Provider credential upgradizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential upgradizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential upgradizability signals.'
            : 'Production upgradizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_upgradizability',
      label: 'Model registry upgradizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry upgradizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry upgradizability signals.'
            : 'Production upgradizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'upgradization_readiness_signal',
      label: 'Upgradization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          upgradizabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Upgradization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              upgradizabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support upgradization readiness.'
            : 'Production upgradizability rollout requires PostgreSQL connectivity, upgradizability tables, provider credential upgradizability, model registry upgradizability, and full signal coverage.',
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
        ? 'Production upgradizability rollout checks passed. Upgradizability coverage and upgradization readiness signal signals are healthy.'
        : 'Production upgradizability rollout is not ready. Resolve failed checks before relying on production upgradizability tooling.',
  }
}

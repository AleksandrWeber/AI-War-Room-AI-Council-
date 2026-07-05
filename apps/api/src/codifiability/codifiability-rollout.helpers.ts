import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CODIFIABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type CodifiabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CodifiabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CodifiabilityRolloutCheck[]
  guidance: string
}

export type CodifiabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCodifiabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateCodifiabilityRollout(
  input: CodifiabilityRolloutInput,
): CodifiabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const codifiabilityTableCoverageComplete =
    input.existingCodifiabilityTableCount === CRITICAL_CODIFIABILITY_TABLES.length

  const checks: CodifiabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL codifiability checks can reach the database.'
            : 'Production codifiability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'codifiability_signal_table_coverage',
      label: 'Codifiability signal table coverage',
      status: codifiabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Codifiability signal table coverage is only enforced in production.'
          : codifiabilityTableCoverageComplete
            ? `${input.existingCodifiabilityTableCount}/${CRITICAL_CODIFIABILITY_TABLES.length} codifiability signal tables are present.`
            : `${input.existingCodifiabilityTableCount}/${CRITICAL_CODIFIABILITY_TABLES.length} codifiability signal tables were found.`,
    },
    {
      name: 'provider_credential_codifiability',
      label: 'Provider credential codifiability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential codifiability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential codifiability signals.'
            : 'Production codifiability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_codifiability',
      label: 'Model registry codifiability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry codifiability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry codifiability signals.'
            : 'Production codifiability rollout requires a model_registry_entries table.',
    },
    {
      name: 'codification_readiness_signal',
      label: 'Codification readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          codifiabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Codification readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              codifiabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support codification readiness.'
            : 'Production codifiability rollout requires PostgreSQL connectivity, codifiability tables, provider credential codifiability, model registry codifiability, and full signal coverage.',
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
        ? 'Production codifiability rollout checks passed. Codifiability coverage and codification readiness signal signals are healthy.'
        : 'Production codifiability rollout is not ready. Resolve failed checks before relying on production codifiability tooling.',
  }
}

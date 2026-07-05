import type { ApiEnv } from '../config/env.js'

export const CRITICAL_IMPORTIZABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type ImportizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ImportizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ImportizabilityRolloutCheck[]
  guidance: string
}

export type ImportizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingImportizabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateImportizabilityRollout(
  input: ImportizabilityRolloutInput,
): ImportizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const importizabilityTableCoverageComplete =
    input.existingImportizabilityTableCount === CRITICAL_IMPORTIZABILITY_TABLES.length

  const checks: ImportizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL importizability checks can reach the database.'
            : 'Production importizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'importizability_signal_table_coverage',
      label: 'Importizability signal table coverage',
      status: importizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Importizability signal table coverage is only enforced in production.'
          : importizabilityTableCoverageComplete
            ? `${input.existingImportizabilityTableCount}/${CRITICAL_IMPORTIZABILITY_TABLES.length} importizability signal tables are present.`
            : `${input.existingImportizabilityTableCount}/${CRITICAL_IMPORTIZABILITY_TABLES.length} importizability signal tables were found.`,
    },
    {
      name: 'provider_credential_importizability',
      label: 'Provider credential importizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential importizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential importizability signals.'
            : 'Production importizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_importizability',
      label: 'Model registry importizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry importizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry importizability signals.'
            : 'Production importizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'importization_readiness_signal',
      label: 'Decentralization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          importizabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Decentralization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              importizabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support importization readiness.'
            : 'Production importizability rollout requires PostgreSQL connectivity, importizability tables, provider credential importizability, model registry importizability, and full signal coverage.',
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
        ? 'Production importizability rollout checks passed. Importizability coverage and decentralization readiness signal signals are healthy.'
        : 'Production importizability rollout is not ready. Resolve failed checks before relying on production importizability tooling.',
  }
}

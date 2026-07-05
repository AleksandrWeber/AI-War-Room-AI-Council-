import type { ApiEnv } from '../config/env.js'

export const CRITICAL_FOLDIZABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type FoldizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type FoldizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: FoldizabilityRolloutCheck[]
  guidance: string
}

export type FoldizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingFoldizabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateFoldizabilityRollout(
  input: FoldizabilityRolloutInput,
): FoldizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const foldizabilityTableCoverageComplete =
    input.existingFoldizabilityTableCount === CRITICAL_FOLDIZABILITY_TABLES.length

  const checks: FoldizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL foldizability checks can reach the database.'
            : 'Production foldizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'foldizability_signal_table_coverage',
      label: 'Foldizability signal table coverage',
      status: foldizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Foldizability signal table coverage is only enforced in production.'
          : foldizabilityTableCoverageComplete
            ? `${input.existingFoldizabilityTableCount}/${CRITICAL_FOLDIZABILITY_TABLES.length} foldizability signal tables are present.`
            : `${input.existingFoldizabilityTableCount}/${CRITICAL_FOLDIZABILITY_TABLES.length} foldizability signal tables were found.`,
    },
    {
      name: 'provider_credential_foldizability',
      label: 'Provider credential foldizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential foldizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential foldizability signals.'
            : 'Production foldizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_foldizability',
      label: 'Model registry foldizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry foldizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry foldizability signals.'
            : 'Production foldizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'foldization_readiness_signal',
      label: 'Decentralization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          foldizabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Decentralization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              foldizabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support foldization readiness.'
            : 'Production foldizability rollout requires PostgreSQL connectivity, foldizability tables, provider credential foldizability, model registry foldizability, and full signal coverage.',
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
        ? 'Production foldizability rollout checks passed. Foldizability coverage and decentralization readiness signal signals are healthy.'
        : 'Production foldizability rollout is not ready. Resolve failed checks before relying on production foldizability tooling.',
  }
}

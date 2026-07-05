import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PAGINIZABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type PaginizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type PaginizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: PaginizabilityRolloutCheck[]
  guidance: string
}

export type PaginizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingPaginizabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluatePaginizabilityRollout(
  input: PaginizabilityRolloutInput,
): PaginizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const paginizabilityTableCoverageComplete =
    input.existingPaginizabilityTableCount === CRITICAL_PAGINIZABILITY_TABLES.length

  const checks: PaginizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL paginizability checks can reach the database.'
            : 'Production paginizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'paginizability_signal_table_coverage',
      label: 'Paginizability signal table coverage',
      status: paginizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Paginizability signal table coverage is only enforced in production.'
          : paginizabilityTableCoverageComplete
            ? `${input.existingPaginizabilityTableCount}/${CRITICAL_PAGINIZABILITY_TABLES.length} paginizability signal tables are present.`
            : `${input.existingPaginizabilityTableCount}/${CRITICAL_PAGINIZABILITY_TABLES.length} paginizability signal tables were found.`,
    },
    {
      name: 'provider_credential_paginizability',
      label: 'Provider credential paginizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential paginizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential paginizability signals.'
            : 'Production paginizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_paginizability',
      label: 'Model registry paginizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry paginizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry paginizability signals.'
            : 'Production paginizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'paginization_readiness_signal',
      label: 'Decentralization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          paginizabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Decentralization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              paginizabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support paginization readiness.'
            : 'Production paginizability rollout requires PostgreSQL connectivity, paginizability tables, provider credential paginizability, model registry paginizability, and full signal coverage.',
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
        ? 'Production paginizability rollout checks passed. Paginizability coverage and decentralization readiness signal signals are healthy.'
        : 'Production paginizability rollout is not ready. Resolve failed checks before relying on production paginizability tooling.',
  }
}

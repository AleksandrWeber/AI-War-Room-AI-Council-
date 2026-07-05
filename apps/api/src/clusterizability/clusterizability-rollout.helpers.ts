import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CLUSTERIZABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type ClusterizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ClusterizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ClusterizabilityRolloutCheck[]
  guidance: string
}

export type ClusterizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingClusterizabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateClusterizabilityRollout(
  input: ClusterizabilityRolloutInput,
): ClusterizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const clusterizabilityTableCoverageComplete =
    input.existingClusterizabilityTableCount === CRITICAL_CLUSTERIZABILITY_TABLES.length

  const checks: ClusterizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL clusterizability checks can reach the database.'
            : 'Production clusterizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'clusterizability_signal_table_coverage',
      label: 'Clusterizability signal table coverage',
      status: clusterizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Clusterizability signal table coverage is only enforced in production.'
          : clusterizabilityTableCoverageComplete
            ? `${input.existingClusterizabilityTableCount}/${CRITICAL_CLUSTERIZABILITY_TABLES.length} clusterizability signal tables are present.`
            : `${input.existingClusterizabilityTableCount}/${CRITICAL_CLUSTERIZABILITY_TABLES.length} clusterizability signal tables were found.`,
    },
    {
      name: 'provider_credential_clusterizability',
      label: 'Provider credential clusterizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential clusterizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential clusterizability signals.'
            : 'Production clusterizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_clusterizability',
      label: 'Model registry clusterizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry clusterizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry clusterizability signals.'
            : 'Production clusterizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'clusterization_readiness_signal',
      label: 'Clusterization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          clusterizabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Clusterization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              clusterizabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support clusterization readiness.'
            : 'Production clusterizability rollout requires PostgreSQL connectivity, clusterizability tables, provider credential clusterizability, model registry clusterizability, and full signal coverage.',
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
        ? 'Production clusterizability rollout checks passed. Clusterizability coverage and clusterization readiness signal signals are healthy.'
        : 'Production clusterizability rollout is not ready. Resolve failed checks before relying on production clusterizability tooling.',
  }
}

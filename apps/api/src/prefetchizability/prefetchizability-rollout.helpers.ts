import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PREFETCHIZABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type PrefetchizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type PrefetchizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: PrefetchizabilityRolloutCheck[]
  guidance: string
}

export type PrefetchizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingPrefetchizabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluatePrefetchizabilityRollout(
  input: PrefetchizabilityRolloutInput,
): PrefetchizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const prefetchizabilityTableCoverageComplete =
    input.existingPrefetchizabilityTableCount === CRITICAL_PREFETCHIZABILITY_TABLES.length

  const checks: PrefetchizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL prefetchizability checks can reach the database.'
            : 'Production prefetchizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'prefetchizability_signal_table_coverage',
      label: 'Prefetchizability signal table coverage',
      status: prefetchizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Prefetchizability signal table coverage is only enforced in production.'
          : prefetchizabilityTableCoverageComplete
            ? `${input.existingPrefetchizabilityTableCount}/${CRITICAL_PREFETCHIZABILITY_TABLES.length} prefetchizability signal tables are present.`
            : `${input.existingPrefetchizabilityTableCount}/${CRITICAL_PREFETCHIZABILITY_TABLES.length} prefetchizability signal tables were found.`,
    },
    {
      name: 'provider_credential_prefetchizability',
      label: 'Provider credential prefetchizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential prefetchizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential prefetchizability signals.'
            : 'Production prefetchizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_prefetchizability',
      label: 'Model registry prefetchizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry prefetchizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry prefetchizability signals.'
            : 'Production prefetchizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'prefetchization_readiness_signal',
      label: 'Decentralization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          prefetchizabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Decentralization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              prefetchizabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support prefetchization readiness.'
            : 'Production prefetchizability rollout requires PostgreSQL connectivity, prefetchizability tables, provider credential prefetchizability, model registry prefetchizability, and full signal coverage.',
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
        ? 'Production prefetchizability rollout checks passed. Prefetchizability coverage and decentralization readiness signal signals are healthy.'
        : 'Production prefetchizability rollout is not ready. Resolve failed checks before relying on production prefetchizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DEDUPIZABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type DedupizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DedupizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DedupizabilityRolloutCheck[]
  guidance: string
}

export type DedupizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDedupizabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateDedupizabilityRollout(
  input: DedupizabilityRolloutInput,
): DedupizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const dedupizabilityTableCoverageComplete =
    input.existingDedupizabilityTableCount === CRITICAL_DEDUPIZABILITY_TABLES.length

  const checks: DedupizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL dedupizability checks can reach the database.'
            : 'Production dedupizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'dedupizability_signal_table_coverage',
      label: 'Dedupizability signal table coverage',
      status: dedupizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Dedupizability signal table coverage is only enforced in production.'
          : dedupizabilityTableCoverageComplete
            ? `${input.existingDedupizabilityTableCount}/${CRITICAL_DEDUPIZABILITY_TABLES.length} dedupizability signal tables are present.`
            : `${input.existingDedupizabilityTableCount}/${CRITICAL_DEDUPIZABILITY_TABLES.length} dedupizability signal tables were found.`,
    },
    {
      name: 'provider_credential_dedupizability',
      label: 'Provider credential dedupizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential dedupizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential dedupizability signals.'
            : 'Production dedupizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_dedupizability',
      label: 'Model registry dedupizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry dedupizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry dedupizability signals.'
            : 'Production dedupizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'dedupization_readiness_signal',
      label: 'Decentralization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          dedupizabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Decentralization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              dedupizabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support dedupization readiness.'
            : 'Production dedupizability rollout requires PostgreSQL connectivity, dedupizability tables, provider credential dedupizability, model registry dedupizability, and full signal coverage.',
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
        ? 'Production dedupizability rollout checks passed. Dedupizability coverage and decentralization readiness signal signals are healthy.'
        : 'Production dedupizability rollout is not ready. Resolve failed checks before relying on production dedupizability tooling.',
  }
}

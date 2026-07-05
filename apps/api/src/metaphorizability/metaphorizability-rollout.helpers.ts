import type { ApiEnv } from '../config/env.js'

export const CRITICAL_METAPHORIZABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type MetaphorizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type MetaphorizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: MetaphorizabilityRolloutCheck[]
  guidance: string
}

export type MetaphorizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingMetaphorizabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateMetaphorizabilityRollout(
  input: MetaphorizabilityRolloutInput,
): MetaphorizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const metaphorizabilityTableCoverageComplete =
    input.existingMetaphorizabilityTableCount === CRITICAL_METAPHORIZABILITY_TABLES.length

  const checks: MetaphorizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL metaphorizability checks can reach the database.'
            : 'Production metaphorizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'metaphorizability_signal_table_coverage',
      label: 'Metaphorizability signal table coverage',
      status: metaphorizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Metaphorizability signal table coverage is only enforced in production.'
          : metaphorizabilityTableCoverageComplete
            ? `${input.existingMetaphorizabilityTableCount}/${CRITICAL_METAPHORIZABILITY_TABLES.length} metaphorizability signal tables are present.`
            : `${input.existingMetaphorizabilityTableCount}/${CRITICAL_METAPHORIZABILITY_TABLES.length} metaphorizability signal tables were found.`,
    },
    {
      name: 'provider_credential_metaphorizability',
      label: 'Provider credential metaphorizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential metaphorizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential metaphorizability signals.'
            : 'Production metaphorizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_metaphorizability',
      label: 'Model registry metaphorizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry metaphorizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry metaphorizability signals.'
            : 'Production metaphorizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'metaphorization_readiness_signal',
      label: 'Metaphorization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          metaphorizabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Metaphorization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              metaphorizabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support metaphorization readiness.'
            : 'Production metaphorizability rollout requires PostgreSQL connectivity, metaphorizability tables, provider credential metaphorizability, model registry metaphorizability, and full signal coverage.',
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
        ? 'Production metaphorizability rollout checks passed. Metaphorizability coverage and metaphorization readiness signal signals are healthy.'
        : 'Production metaphorizability rollout is not ready. Resolve failed checks before relying on production metaphorizability tooling.',
  }
}

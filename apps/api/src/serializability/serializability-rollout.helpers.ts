import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SERIALIZABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type SerializabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SerializabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SerializabilityRolloutCheck[]
  guidance: string
}

export type SerializabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSerializabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateSerializabilityRollout(
  input: SerializabilityRolloutInput,
): SerializabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const serializabilityTableCoverageComplete =
    input.existingSerializabilityTableCount === CRITICAL_SERIALIZABILITY_TABLES.length

  const checks: SerializabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL serializability checks can reach the database.'
            : 'Production serializability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'serializability_signal_table_coverage',
      label: 'Serializability signal table coverage',
      status: serializabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Serializability signal table coverage is only enforced in production.'
          : serializabilityTableCoverageComplete
            ? `${input.existingSerializabilityTableCount}/${CRITICAL_SERIALIZABILITY_TABLES.length} serializability signal tables are present.`
            : `${input.existingSerializabilityTableCount}/${CRITICAL_SERIALIZABILITY_TABLES.length} serializability signal tables were found.`,
    },
    {
      name: 'provider_credential_serializability',
      label: 'Provider credential serializability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential serializability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential serializability signals.'
            : 'Production serializability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_serializability',
      label: 'Model registry serializability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry serializability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry serializability signals.'
            : 'Production serializability rollout requires a model_registry_entries table.',
    },
    {
      name: 'serialization_readiness_signal',
      label: 'Serialization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          serializabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Serialization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              serializabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support serialization readiness.'
            : 'Production serializability rollout requires PostgreSQL connectivity, serializability tables, provider credential serializability, model registry serializability, and full signal coverage.',
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
        ? 'Production serializability rollout checks passed. Serializability coverage and serialization readiness signal signals are healthy.'
        : 'Production serializability rollout is not ready. Resolve failed checks before relying on production serializability tooling.',
  }
}

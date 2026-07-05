import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DECENTRALIZABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type DecentralizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DecentralizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DecentralizabilityRolloutCheck[]
  guidance: string
}

export type DecentralizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDecentralizabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateDecentralizabilityRollout(
  input: DecentralizabilityRolloutInput,
): DecentralizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const decentralizabilityTableCoverageComplete =
    input.existingDecentralizabilityTableCount === CRITICAL_DECENTRALIZABILITY_TABLES.length

  const checks: DecentralizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL decentralizability checks can reach the database.'
            : 'Production decentralizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'decentralizability_signal_table_coverage',
      label: 'Decentralizability signal table coverage',
      status: decentralizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Decentralizability signal table coverage is only enforced in production.'
          : decentralizabilityTableCoverageComplete
            ? `${input.existingDecentralizabilityTableCount}/${CRITICAL_DECENTRALIZABILITY_TABLES.length} decentralizability signal tables are present.`
            : `${input.existingDecentralizabilityTableCount}/${CRITICAL_DECENTRALIZABILITY_TABLES.length} decentralizability signal tables were found.`,
    },
    {
      name: 'provider_credential_decentralizability',
      label: 'Provider credential decentralizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential decentralizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential decentralizability signals.'
            : 'Production decentralizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_decentralizability',
      label: 'Model registry decentralizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry decentralizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry decentralizability signals.'
            : 'Production decentralizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'decentralization_readiness_signal',
      label: 'Decentralization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          decentralizabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Decentralization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              decentralizabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support decentralization readiness.'
            : 'Production decentralizability rollout requires PostgreSQL connectivity, decentralizability tables, provider credential decentralizability, model registry decentralizability, and full signal coverage.',
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
        ? 'Production decentralizability rollout checks passed. Decentralizability coverage and decentralization readiness signal signals are healthy.'
        : 'Production decentralizability rollout is not ready. Resolve failed checks before relying on production decentralizability tooling.',
  }
}

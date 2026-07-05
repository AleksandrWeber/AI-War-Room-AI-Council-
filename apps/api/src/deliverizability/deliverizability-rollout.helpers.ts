import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DELIVERIZABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type DeliverizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DeliverizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DeliverizabilityRolloutCheck[]
  guidance: string
}

export type DeliverizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDeliverizabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateDeliverizabilityRollout(
  input: DeliverizabilityRolloutInput,
): DeliverizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const deliverizabilityTableCoverageComplete =
    input.existingDeliverizabilityTableCount === CRITICAL_DELIVERIZABILITY_TABLES.length

  const checks: DeliverizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL deliverizability checks can reach the database.'
            : 'Production deliverizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'deliverizability_signal_table_coverage',
      label: 'Deliverizability signal table coverage',
      status: deliverizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Deliverizability signal table coverage is only enforced in production.'
          : deliverizabilityTableCoverageComplete
            ? `${input.existingDeliverizabilityTableCount}/${CRITICAL_DELIVERIZABILITY_TABLES.length} deliverizability signal tables are present.`
            : `${input.existingDeliverizabilityTableCount}/${CRITICAL_DELIVERIZABILITY_TABLES.length} deliverizability signal tables were found.`,
    },
    {
      name: 'provider_credential_deliverizability',
      label: 'Provider credential deliverizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential deliverizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential deliverizability signals.'
            : 'Production deliverizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_deliverizability',
      label: 'Model registry deliverizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry deliverizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry deliverizability signals.'
            : 'Production deliverizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'deliverization_readiness_signal',
      label: 'Decentralization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          deliverizabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Decentralization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              deliverizabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support deliverization readiness.'
            : 'Production deliverizability rollout requires PostgreSQL connectivity, deliverizability tables, provider credential deliverizability, model registry deliverizability, and full signal coverage.',
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
        ? 'Production deliverizability rollout checks passed. Deliverizability coverage and decentralization readiness signal signals are healthy.'
        : 'Production deliverizability rollout is not ready. Resolve failed checks before relying on production deliverizability tooling.',
  }
}

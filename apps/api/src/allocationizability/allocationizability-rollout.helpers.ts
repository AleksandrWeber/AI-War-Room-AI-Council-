import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ALLOCATIONIZABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type AllocationizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AllocationizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AllocationizabilityRolloutCheck[]
  guidance: string
}

export type AllocationizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAllocationizabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateAllocationizabilityRollout(
  input: AllocationizabilityRolloutInput,
): AllocationizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const allocationizabilityTableCoverageComplete =
    input.existingAllocationizabilityTableCount === CRITICAL_ALLOCATIONIZABILITY_TABLES.length

  const checks: AllocationizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL allocationizability checks can reach the database.'
            : 'Production allocationizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'allocationizability_signal_table_coverage',
      label: 'Allocationizability signal table coverage',
      status: allocationizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Allocationizability signal table coverage is only enforced in production.'
          : allocationizabilityTableCoverageComplete
            ? `${input.existingAllocationizabilityTableCount}/${CRITICAL_ALLOCATIONIZABILITY_TABLES.length} allocationizability signal tables are present.`
            : `${input.existingAllocationizabilityTableCount}/${CRITICAL_ALLOCATIONIZABILITY_TABLES.length} allocationizability signal tables were found.`,
    },
    {
      name: 'provider_credential_allocationizability',
      label: 'Provider credential allocationizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential allocationizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential allocationizability signals.'
            : 'Production allocationizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_allocationizability',
      label: 'Model registry allocationizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry allocationizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry allocationizability signals.'
            : 'Production allocationizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'allocationization_readiness_signal',
      label: 'Decentralization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          allocationizabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Decentralization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              allocationizabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support allocationization readiness.'
            : 'Production allocationizability rollout requires PostgreSQL connectivity, allocationizability tables, provider credential allocationizability, model registry allocationizability, and full signal coverage.',
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
        ? 'Production allocationizability rollout checks passed. Allocationizability coverage and decentralization readiness signal signals are healthy.'
        : 'Production allocationizability rollout is not ready. Resolve failed checks before relying on production allocationizability tooling.',
  }
}

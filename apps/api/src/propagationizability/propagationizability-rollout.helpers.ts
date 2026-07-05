import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PROPAGATIONIZABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type PropagationizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type PropagationizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: PropagationizabilityRolloutCheck[]
  guidance: string
}

export type PropagationizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingPropagationizabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluatePropagationizabilityRollout(
  input: PropagationizabilityRolloutInput,
): PropagationizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const propagationizabilityTableCoverageComplete =
    input.existingPropagationizabilityTableCount === CRITICAL_PROPAGATIONIZABILITY_TABLES.length

  const checks: PropagationizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL propagationizability checks can reach the database.'
            : 'Production propagationizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'propagationizability_signal_table_coverage',
      label: 'Propagationizability signal table coverage',
      status: propagationizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Propagationizability signal table coverage is only enforced in production.'
          : propagationizabilityTableCoverageComplete
            ? `${input.existingPropagationizabilityTableCount}/${CRITICAL_PROPAGATIONIZABILITY_TABLES.length} propagationizability signal tables are present.`
            : `${input.existingPropagationizabilityTableCount}/${CRITICAL_PROPAGATIONIZABILITY_TABLES.length} propagationizability signal tables were found.`,
    },
    {
      name: 'provider_credential_propagationizability',
      label: 'Provider credential propagationizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential propagationizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential propagationizability signals.'
            : 'Production propagationizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_propagationizability',
      label: 'Model registry propagationizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry propagationizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry propagationizability signals.'
            : 'Production propagationizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'propagationization_readiness_signal',
      label: 'Decentralization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          propagationizabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Decentralization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              propagationizabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support propagationization readiness.'
            : 'Production propagationizability rollout requires PostgreSQL connectivity, propagationizability tables, provider credential propagationizability, model registry propagationizability, and full signal coverage.',
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
        ? 'Production propagationizability rollout checks passed. Propagationizability coverage and decentralization readiness signal signals are healthy.'
        : 'Production propagationizability rollout is not ready. Resolve failed checks before relying on production propagationizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_STABILIZABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type StabilizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type StabilizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: StabilizabilityRolloutCheck[]
  guidance: string
}

export type StabilizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingStabilizabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateStabilizabilityRollout(
  input: StabilizabilityRolloutInput,
): StabilizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const stabilizabilityTableCoverageComplete =
    input.existingStabilizabilityTableCount === CRITICAL_STABILIZABILITY_TABLES.length

  const checks: StabilizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL stabilizability checks can reach the database.'
            : 'Production stabilizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'stabilizability_signal_table_coverage',
      label: 'Stabilizability signal table coverage',
      status: stabilizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Stabilizability signal table coverage is only enforced in production.'
          : stabilizabilityTableCoverageComplete
            ? `${input.existingStabilizabilityTableCount}/${CRITICAL_STABILIZABILITY_TABLES.length} stabilizability signal tables are present.`
            : `${input.existingStabilizabilityTableCount}/${CRITICAL_STABILIZABILITY_TABLES.length} stabilizability signal tables were found.`,
    },
    {
      name: 'provider_credential_stabilizability',
      label: 'Provider credential stabilizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential stabilizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential stabilizability signals.'
            : 'Production stabilizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_stabilizability',
      label: 'Model registry stabilizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry stabilizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry stabilizability signals.'
            : 'Production stabilizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'stabilization_readiness_signal',
      label: 'Stabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          stabilizabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Stabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              stabilizabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support stabilization readiness.'
            : 'Production stabilizability rollout requires PostgreSQL connectivity, stabilizability tables, provider credential stabilizability, model registry stabilizability, and full signal coverage.',
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
        ? 'Production stabilizability rollout checks passed. Stabilizability coverage and stabilization readiness signal signals are healthy.'
        : 'Production stabilizability rollout is not ready. Resolve failed checks before relying on production stabilizability tooling.',
  }
}

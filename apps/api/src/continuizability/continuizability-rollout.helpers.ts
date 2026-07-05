import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CONTINUIZABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type ContinuizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ContinuizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ContinuizabilityRolloutCheck[]
  guidance: string
}

export type ContinuizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingContinuizabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateContinuizabilityRollout(
  input: ContinuizabilityRolloutInput,
): ContinuizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const continuizabilityTableCoverageComplete =
    input.existingContinuizabilityTableCount === CRITICAL_CONTINUIZABILITY_TABLES.length

  const checks: ContinuizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL continuizability checks can reach the database.'
            : 'Production continuizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'continuizability_signal_table_coverage',
      label: 'Continuizability signal table coverage',
      status: continuizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Continuizability signal table coverage is only enforced in production.'
          : continuizabilityTableCoverageComplete
            ? `${input.existingContinuizabilityTableCount}/${CRITICAL_CONTINUIZABILITY_TABLES.length} continuizability signal tables are present.`
            : `${input.existingContinuizabilityTableCount}/${CRITICAL_CONTINUIZABILITY_TABLES.length} continuizability signal tables were found.`,
    },
    {
      name: 'provider_credential_continuizability',
      label: 'Provider credential continuizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential continuizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential continuizability signals.'
            : 'Production continuizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_continuizability',
      label: 'Model registry continuizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry continuizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry continuizability signals.'
            : 'Production continuizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'continuization_readiness_signal',
      label: 'Continuization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          continuizabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Continuization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              continuizabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support continuization readiness.'
            : 'Production continuizability rollout requires PostgreSQL connectivity, continuizability tables, provider credential continuizability, model registry continuizability, and full signal coverage.',
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
        ? 'Production continuizability rollout checks passed. Continuizability coverage and continuization readiness signal signals are healthy.'
        : 'Production continuizability rollout is not ready. Resolve failed checks before relying on production continuizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PREDICTIZABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type PredictizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type PredictizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: PredictizabilityRolloutCheck[]
  guidance: string
}

export type PredictizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingPredictizabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluatePredictizabilityRollout(
  input: PredictizabilityRolloutInput,
): PredictizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const predictizabilityTableCoverageComplete =
    input.existingPredictizabilityTableCount === CRITICAL_PREDICTIZABILITY_TABLES.length

  const checks: PredictizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL predictizability checks can reach the database.'
            : 'Production predictizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'predictizability_signal_table_coverage',
      label: 'Predictizability signal table coverage',
      status: predictizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Predictizability signal table coverage is only enforced in production.'
          : predictizabilityTableCoverageComplete
            ? `${input.existingPredictizabilityTableCount}/${CRITICAL_PREDICTIZABILITY_TABLES.length} predictizability signal tables are present.`
            : `${input.existingPredictizabilityTableCount}/${CRITICAL_PREDICTIZABILITY_TABLES.length} predictizability signal tables were found.`,
    },
    {
      name: 'provider_credential_predictizability',
      label: 'Provider credential predictizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential predictizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential predictizability signals.'
            : 'Production predictizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_predictizability',
      label: 'Model registry predictizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry predictizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry predictizability signals.'
            : 'Production predictizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'predictization_readiness_signal',
      label: 'Predictization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          predictizabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Predictization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              predictizabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support predictization readiness.'
            : 'Production predictizability rollout requires PostgreSQL connectivity, predictizability tables, provider credential predictizability, model registry predictizability, and full signal coverage.',
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
        ? 'Production predictizability rollout checks passed. Predictizability coverage and predictization readiness signal signals are healthy.'
        : 'Production predictizability rollout is not ready. Resolve failed checks before relying on production predictizability tooling.',
  }
}

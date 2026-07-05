import type { ApiEnv } from '../config/env.js'

export const CRITICAL_FORMALIZABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type FormalizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type FormalizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: FormalizabilityRolloutCheck[]
  guidance: string
}

export type FormalizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingFormalizabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateFormalizabilityRollout(
  input: FormalizabilityRolloutInput,
): FormalizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const formalizabilityTableCoverageComplete =
    input.existingFormalizabilityTableCount === CRITICAL_FORMALIZABILITY_TABLES.length

  const checks: FormalizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL formalizability checks can reach the database.'
            : 'Production formalizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'formalizability_signal_table_coverage',
      label: 'Formalizability signal table coverage',
      status: formalizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Formalizability signal table coverage is only enforced in production.'
          : formalizabilityTableCoverageComplete
            ? `${input.existingFormalizabilityTableCount}/${CRITICAL_FORMALIZABILITY_TABLES.length} formalizability signal tables are present.`
            : `${input.existingFormalizabilityTableCount}/${CRITICAL_FORMALIZABILITY_TABLES.length} formalizability signal tables were found.`,
    },
    {
      name: 'provider_credential_formalizability',
      label: 'Provider credential formalizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential formalizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential formalizability signals.'
            : 'Production formalizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_formalizability',
      label: 'Model registry formalizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry formalizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry formalizability signals.'
            : 'Production formalizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'formalization_readiness_signal',
      label: 'Formalization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          formalizabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Formalization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              formalizabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support formalization readiness.'
            : 'Production formalizability rollout requires PostgreSQL connectivity, formalizability tables, provider credential formalizability, model registry formalizability, and full signal coverage.',
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
        ? 'Production formalizability rollout checks passed. Formalizability coverage and formalization readiness signal signals are healthy.'
        : 'Production formalizability rollout is not ready. Resolve failed checks before relying on production formalizability tooling.',
  }
}

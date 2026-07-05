import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PROGRESSIVEIZABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type ProgressiveizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ProgressiveizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ProgressiveizabilityRolloutCheck[]
  guidance: string
}

export type ProgressiveizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingProgressiveizabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateProgressiveizabilityRollout(
  input: ProgressiveizabilityRolloutInput,
): ProgressiveizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const progressiveizabilityTableCoverageComplete =
    input.existingProgressiveizabilityTableCount === CRITICAL_PROGRESSIVEIZABILITY_TABLES.length

  const checks: ProgressiveizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL progressiveizability checks can reach the database.'
            : 'Production progressiveizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'progressiveizability_signal_table_coverage',
      label: 'Progressiveizability signal table coverage',
      status: progressiveizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Progressiveizability signal table coverage is only enforced in production.'
          : progressiveizabilityTableCoverageComplete
            ? `${input.existingProgressiveizabilityTableCount}/${CRITICAL_PROGRESSIVEIZABILITY_TABLES.length} progressiveizability signal tables are present.`
            : `${input.existingProgressiveizabilityTableCount}/${CRITICAL_PROGRESSIVEIZABILITY_TABLES.length} progressiveizability signal tables were found.`,
    },
    {
      name: 'provider_credential_progressiveizability',
      label: 'Provider credential progressiveizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential progressiveizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential progressiveizability signals.'
            : 'Production progressiveizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_progressiveizability',
      label: 'Model registry progressiveizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry progressiveizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry progressiveizability signals.'
            : 'Production progressiveizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'progressiveization_readiness_signal',
      label: 'Progressiveization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          progressiveizabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Progressiveization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              progressiveizabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support progressiveization readiness.'
            : 'Production progressiveizability rollout requires PostgreSQL connectivity, progressiveizability tables, provider credential progressiveizability, model registry progressiveizability, and full signal coverage.',
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
        ? 'Production progressiveizability rollout checks passed. Progressiveizability coverage and progressiveization readiness signal signals are healthy.'
        : 'Production progressiveizability rollout is not ready. Resolve failed checks before relying on production progressiveizability tooling.',
  }
}

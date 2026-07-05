import type { ApiEnv } from '../config/env.js'

export const CRITICAL_HISTORIZABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type HistorizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type HistorizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: HistorizabilityRolloutCheck[]
  guidance: string
}

export type HistorizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingHistorizabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateHistorizabilityRollout(
  input: HistorizabilityRolloutInput,
): HistorizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const historizabilityTableCoverageComplete =
    input.existingHistorizabilityTableCount === CRITICAL_HISTORIZABILITY_TABLES.length

  const checks: HistorizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL historizability checks can reach the database.'
            : 'Production historizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'historizability_signal_table_coverage',
      label: 'Historizability signal table coverage',
      status: historizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Historizability signal table coverage is only enforced in production.'
          : historizabilityTableCoverageComplete
            ? `${input.existingHistorizabilityTableCount}/${CRITICAL_HISTORIZABILITY_TABLES.length} historizability signal tables are present.`
            : `${input.existingHistorizabilityTableCount}/${CRITICAL_HISTORIZABILITY_TABLES.length} historizability signal tables were found.`,
    },
    {
      name: 'provider_credential_historizability',
      label: 'Provider credential historizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential historizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential historizability signals.'
            : 'Production historizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_historizability',
      label: 'Model registry historizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry historizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry historizability signals.'
            : 'Production historizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'historization_readiness_signal',
      label: 'Historization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          historizabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Historization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              historizabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support historization readiness.'
            : 'Production historizability rollout requires PostgreSQL connectivity, historizability tables, provider credential historizability, model registry historizability, and full signal coverage.',
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
        ? 'Production historizability rollout checks passed. Historizability coverage and historization readiness signal signals are healthy.'
        : 'Production historizability rollout is not ready. Resolve failed checks before relying on production historizability tooling.',
  }
}

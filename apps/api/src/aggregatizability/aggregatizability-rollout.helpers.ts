import type { ApiEnv } from '../config/env.js'

export const CRITICAL_AGGREGATIZABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type AggregatizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AggregatizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AggregatizabilityRolloutCheck[]
  guidance: string
}

export type AggregatizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAggregatizabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateAggregatizabilityRollout(
  input: AggregatizabilityRolloutInput,
): AggregatizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const aggregatizabilityTableCoverageComplete =
    input.existingAggregatizabilityTableCount === CRITICAL_AGGREGATIZABILITY_TABLES.length

  const checks: AggregatizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL aggregatizability checks can reach the database.'
            : 'Production aggregatizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'aggregatizability_signal_table_coverage',
      label: 'Aggregatizability signal table coverage',
      status: aggregatizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Aggregatizability signal table coverage is only enforced in production.'
          : aggregatizabilityTableCoverageComplete
            ? `${input.existingAggregatizabilityTableCount}/${CRITICAL_AGGREGATIZABILITY_TABLES.length} aggregatizability signal tables are present.`
            : `${input.existingAggregatizabilityTableCount}/${CRITICAL_AGGREGATIZABILITY_TABLES.length} aggregatizability signal tables were found.`,
    },
    {
      name: 'provider_credential_aggregatizability',
      label: 'Provider credential aggregatizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential aggregatizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential aggregatizability signals.'
            : 'Production aggregatizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_aggregatizability',
      label: 'Model registry aggregatizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry aggregatizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry aggregatizability signals.'
            : 'Production aggregatizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'aggregatization_readiness_signal',
      label: 'Aggregatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          aggregatizabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Aggregatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              aggregatizabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support aggregatization readiness.'
            : 'Production aggregatizability rollout requires PostgreSQL connectivity, aggregatizability tables, provider credential aggregatizability, model registry aggregatizability, and full signal coverage.',
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
        ? 'Production aggregatizability rollout checks passed. Aggregatizability coverage and aggregatization readiness signal signals are healthy.'
        : 'Production aggregatizability rollout is not ready. Resolve failed checks before relying on production aggregatizability tooling.',
  }
}

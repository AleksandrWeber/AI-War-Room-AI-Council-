import type { ApiEnv } from '../config/env.js'

export const CRITICAL_BROKERIZABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type BrokerizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type BrokerizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: BrokerizabilityRolloutCheck[]
  guidance: string
}

export type BrokerizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingBrokerizabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateBrokerizabilityRollout(
  input: BrokerizabilityRolloutInput,
): BrokerizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const brokerizabilityTableCoverageComplete =
    input.existingBrokerizabilityTableCount === CRITICAL_BROKERIZABILITY_TABLES.length

  const checks: BrokerizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL brokerizability checks can reach the database.'
            : 'Production brokerizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'brokerizability_signal_table_coverage',
      label: 'Brokerizability signal table coverage',
      status: brokerizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Brokerizability signal table coverage is only enforced in production.'
          : brokerizabilityTableCoverageComplete
            ? `${input.existingBrokerizabilityTableCount}/${CRITICAL_BROKERIZABILITY_TABLES.length} brokerizability signal tables are present.`
            : `${input.existingBrokerizabilityTableCount}/${CRITICAL_BROKERIZABILITY_TABLES.length} brokerizability signal tables were found.`,
    },
    {
      name: 'provider_credential_brokerizability',
      label: 'Provider credential brokerizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential brokerizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential brokerizability signals.'
            : 'Production brokerizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_brokerizability',
      label: 'Model registry brokerizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry brokerizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry brokerizability signals.'
            : 'Production brokerizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'brokerization_readiness_signal',
      label: 'Decentralization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          brokerizabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Decentralization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              brokerizabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support brokerization readiness.'
            : 'Production brokerizability rollout requires PostgreSQL connectivity, brokerizability tables, provider credential brokerizability, model registry brokerizability, and full signal coverage.',
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
        ? 'Production brokerizability rollout checks passed. Brokerizability coverage and decentralization readiness signal signals are healthy.'
        : 'Production brokerizability rollout is not ready. Resolve failed checks before relying on production brokerizability tooling.',
  }
}

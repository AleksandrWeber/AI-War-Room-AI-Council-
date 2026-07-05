import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SIMULATIZABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type SimulatizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SimulatizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SimulatizabilityRolloutCheck[]
  guidance: string
}

export type SimulatizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSimulatizabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateSimulatizabilityRollout(
  input: SimulatizabilityRolloutInput,
): SimulatizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const simulatizabilityTableCoverageComplete =
    input.existingSimulatizabilityTableCount === CRITICAL_SIMULATIZABILITY_TABLES.length

  const checks: SimulatizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL simulatizability checks can reach the database.'
            : 'Production simulatizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'simulatizability_signal_table_coverage',
      label: 'Simulatizability signal table coverage',
      status: simulatizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Simulatizability signal table coverage is only enforced in production.'
          : simulatizabilityTableCoverageComplete
            ? `${input.existingSimulatizabilityTableCount}/${CRITICAL_SIMULATIZABILITY_TABLES.length} simulatizability signal tables are present.`
            : `${input.existingSimulatizabilityTableCount}/${CRITICAL_SIMULATIZABILITY_TABLES.length} simulatizability signal tables were found.`,
    },
    {
      name: 'provider_credential_simulatizability',
      label: 'Provider credential simulatizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential simulatizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential simulatizability signals.'
            : 'Production simulatizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_simulatizability',
      label: 'Model registry simulatizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry simulatizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry simulatizability signals.'
            : 'Production simulatizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'simulatization_readiness_signal',
      label: 'Simulatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          simulatizabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Simulatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              simulatizabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support simulatization readiness.'
            : 'Production simulatizability rollout requires PostgreSQL connectivity, simulatizability tables, provider credential simulatizability, model registry simulatizability, and full signal coverage.',
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
        ? 'Production simulatizability rollout checks passed. Simulatizability coverage and simulatization readiness signal signals are healthy.'
        : 'Production simulatizability rollout is not ready. Resolve failed checks before relying on production simulatizability tooling.',
  }
}

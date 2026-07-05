import type { ApiEnv } from '../config/env.js'

export const CRITICAL_INTERFABILIZABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type InterfabilizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type InterfabilizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: InterfabilizabilityRolloutCheck[]
  guidance: string
}

export type InterfabilizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingInterfabilizabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateInterfabilizabilityRollout(
  input: InterfabilizabilityRolloutInput,
): InterfabilizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const interfabilizabilityTableCoverageComplete =
    input.existingInterfabilizabilityTableCount === CRITICAL_INTERFABILIZABILITY_TABLES.length

  const checks: InterfabilizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL interfabilizability checks can reach the database.'
            : 'Production interfabilizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'interfabilizability_signal_table_coverage',
      label: 'Interfabilizability signal table coverage',
      status: interfabilizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Interfabilizability signal table coverage is only enforced in production.'
          : interfabilizabilityTableCoverageComplete
            ? `${input.existingInterfabilizabilityTableCount}/${CRITICAL_INTERFABILIZABILITY_TABLES.length} interfabilizability signal tables are present.`
            : `${input.existingInterfabilizabilityTableCount}/${CRITICAL_INTERFABILIZABILITY_TABLES.length} interfabilizability signal tables were found.`,
    },
    {
      name: 'provider_credential_interfabilizability',
      label: 'Provider credential interfabilizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential interfabilizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential interfabilizability signals.'
            : 'Production interfabilizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_interfabilizability',
      label: 'Model registry interfabilizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry interfabilizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry interfabilizability signals.'
            : 'Production interfabilizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'interfabization_readiness_signal',
      label: 'Interfabization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          interfabilizabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Interfabization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              interfabilizabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support interfabization readiness.'
            : 'Production interfabilizability rollout requires PostgreSQL connectivity, interfabilizability tables, provider credential interfabilizability, model registry interfabilizability, and full signal coverage.',
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
        ? 'Production interfabilizability rollout checks passed. Interfabilizability coverage and interfabization readiness signal signals are healthy.'
        : 'Production interfabilizability rollout is not ready. Resolve failed checks before relying on production interfabilizability tooling.',
  }
}

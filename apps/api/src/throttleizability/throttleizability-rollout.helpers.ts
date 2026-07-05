import type { ApiEnv } from '../config/env.js'

export const CRITICAL_THROTTLEIZABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type ThrottleizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ThrottleizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ThrottleizabilityRolloutCheck[]
  guidance: string
}

export type ThrottleizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingThrottleizabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateThrottleizabilityRollout(
  input: ThrottleizabilityRolloutInput,
): ThrottleizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const throttleizabilityTableCoverageComplete =
    input.existingThrottleizabilityTableCount === CRITICAL_THROTTLEIZABILITY_TABLES.length

  const checks: ThrottleizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL throttleizability checks can reach the database.'
            : 'Production throttleizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'throttleizability_signal_table_coverage',
      label: 'Throttleizability signal table coverage',
      status: throttleizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Throttleizability signal table coverage is only enforced in production.'
          : throttleizabilityTableCoverageComplete
            ? `${input.existingThrottleizabilityTableCount}/${CRITICAL_THROTTLEIZABILITY_TABLES.length} throttleizability signal tables are present.`
            : `${input.existingThrottleizabilityTableCount}/${CRITICAL_THROTTLEIZABILITY_TABLES.length} throttleizability signal tables were found.`,
    },
    {
      name: 'provider_credential_throttleizability',
      label: 'Provider credential throttleizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential throttleizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential throttleizability signals.'
            : 'Production throttleizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_throttleizability',
      label: 'Model registry throttleizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry throttleizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry throttleizability signals.'
            : 'Production throttleizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'throttleization_readiness_signal',
      label: 'Decentralization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          throttleizabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Decentralization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              throttleizabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support throttleization readiness.'
            : 'Production throttleizability rollout requires PostgreSQL connectivity, throttleizability tables, provider credential throttleizability, model registry throttleizability, and full signal coverage.',
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
        ? 'Production throttleizability rollout checks passed. Throttleizability coverage and decentralization readiness signal signals are healthy.'
        : 'Production throttleizability rollout is not ready. Resolve failed checks before relying on production throttleizability tooling.',
  }
}

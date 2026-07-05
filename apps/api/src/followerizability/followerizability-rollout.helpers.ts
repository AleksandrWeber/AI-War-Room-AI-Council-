import type { ApiEnv } from '../config/env.js'

export const CRITICAL_FOLLOWERIZABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type FollowerizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type FollowerizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: FollowerizabilityRolloutCheck[]
  guidance: string
}

export type FollowerizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingFollowerizabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateFollowerizabilityRollout(
  input: FollowerizabilityRolloutInput,
): FollowerizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const followerizabilityTableCoverageComplete =
    input.existingFollowerizabilityTableCount === CRITICAL_FOLLOWERIZABILITY_TABLES.length

  const checks: FollowerizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL followerizability checks can reach the database.'
            : 'Production followerizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'followerizability_signal_table_coverage',
      label: 'Followerizability signal table coverage',
      status: followerizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Followerizability signal table coverage is only enforced in production.'
          : followerizabilityTableCoverageComplete
            ? `${input.existingFollowerizabilityTableCount}/${CRITICAL_FOLLOWERIZABILITY_TABLES.length} followerizability signal tables are present.`
            : `${input.existingFollowerizabilityTableCount}/${CRITICAL_FOLLOWERIZABILITY_TABLES.length} followerizability signal tables were found.`,
    },
    {
      name: 'provider_credential_followerizability',
      label: 'Provider credential followerizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential followerizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential followerizability signals.'
            : 'Production followerizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_followerizability',
      label: 'Model registry followerizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry followerizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry followerizability signals.'
            : 'Production followerizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'followerization_readiness_signal',
      label: 'Decentralization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          followerizabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Decentralization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              followerizabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support followerization readiness.'
            : 'Production followerizability rollout requires PostgreSQL connectivity, followerizability tables, provider credential followerizability, model registry followerizability, and full signal coverage.',
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
        ? 'Production followerizability rollout checks passed. Followerizability coverage and decentralization readiness signal signals are healthy.'
        : 'Production followerizability rollout is not ready. Resolve failed checks before relying on production followerizability tooling.',
  }
}

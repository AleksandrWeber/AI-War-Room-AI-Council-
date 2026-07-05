import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ROUTINGIZABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type RoutingizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RoutingizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RoutingizabilityRolloutCheck[]
  guidance: string
}

export type RoutingizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRoutingizabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateRoutingizabilityRollout(
  input: RoutingizabilityRolloutInput,
): RoutingizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const routingizabilityTableCoverageComplete =
    input.existingRoutingizabilityTableCount === CRITICAL_ROUTINGIZABILITY_TABLES.length

  const checks: RoutingizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL routingizability checks can reach the database.'
            : 'Production routingizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'routingizability_signal_table_coverage',
      label: 'Routingizability signal table coverage',
      status: routingizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Routingizability signal table coverage is only enforced in production.'
          : routingizabilityTableCoverageComplete
            ? `${input.existingRoutingizabilityTableCount}/${CRITICAL_ROUTINGIZABILITY_TABLES.length} routingizability signal tables are present.`
            : `${input.existingRoutingizabilityTableCount}/${CRITICAL_ROUTINGIZABILITY_TABLES.length} routingizability signal tables were found.`,
    },
    {
      name: 'provider_credential_routingizability',
      label: 'Provider credential routingizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential routingizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential routingizability signals.'
            : 'Production routingizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_routingizability',
      label: 'Model registry routingizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry routingizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry routingizability signals.'
            : 'Production routingizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'routingization_readiness_signal',
      label: 'Decentralization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          routingizabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Decentralization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              routingizabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support routingization readiness.'
            : 'Production routingizability rollout requires PostgreSQL connectivity, routingizability tables, provider credential routingizability, model registry routingizability, and full signal coverage.',
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
        ? 'Production routingizability rollout checks passed. Routingizability coverage and decentralization readiness signal signals are healthy.'
        : 'Production routingizability rollout is not ready. Resolve failed checks before relying on production routingizability tooling.',
  }
}

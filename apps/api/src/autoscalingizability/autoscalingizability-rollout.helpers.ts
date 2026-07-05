import type { ApiEnv } from '../config/env.js'

export const CRITICAL_AUTOSCALINGIZABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type AutoscalingizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AutoscalingizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AutoscalingizabilityRolloutCheck[]
  guidance: string
}

export type AutoscalingizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAutoscalingizabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateAutoscalingizabilityRollout(
  input: AutoscalingizabilityRolloutInput,
): AutoscalingizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const autoscalingizabilityTableCoverageComplete =
    input.existingAutoscalingizabilityTableCount === CRITICAL_AUTOSCALINGIZABILITY_TABLES.length

  const checks: AutoscalingizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL autoscalingizability checks can reach the database.'
            : 'Production autoscalingizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'autoscalingizability_signal_table_coverage',
      label: 'Autoscalingizability signal table coverage',
      status: autoscalingizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Autoscalingizability signal table coverage is only enforced in production.'
          : autoscalingizabilityTableCoverageComplete
            ? `${input.existingAutoscalingizabilityTableCount}/${CRITICAL_AUTOSCALINGIZABILITY_TABLES.length} autoscalingizability signal tables are present.`
            : `${input.existingAutoscalingizabilityTableCount}/${CRITICAL_AUTOSCALINGIZABILITY_TABLES.length} autoscalingizability signal tables were found.`,
    },
    {
      name: 'provider_credential_autoscalingizability',
      label: 'Provider credential autoscalingizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential autoscalingizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential autoscalingizability signals.'
            : 'Production autoscalingizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_autoscalingizability',
      label: 'Model registry autoscalingizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry autoscalingizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry autoscalingizability signals.'
            : 'Production autoscalingizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'autoscalingization_readiness_signal',
      label: 'Autoscalingization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          autoscalingizabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Autoscalingization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              autoscalingizabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support autoscalingization readiness.'
            : 'Production autoscalingizability rollout requires PostgreSQL connectivity, autoscalingizability tables, provider credential autoscalingizability, model registry autoscalingizability, and full signal coverage.',
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
        ? 'Production autoscalingizability rollout checks passed. Autoscalingizability coverage and autoscalingization readiness signal signals are healthy.'
        : 'Production autoscalingizability rollout is not ready. Resolve failed checks before relying on production autoscalingizability tooling.',
  }
}

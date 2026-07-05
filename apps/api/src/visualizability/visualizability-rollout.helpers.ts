import type { ApiEnv } from '../config/env.js'

export const CRITICAL_VISUALIZABILITY_TABLES = [
  'model_registry_entries',
  'model_health_events',
  'workspace_provider_credentials',
] as const

export type VisualizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type VisualizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: VisualizabilityRolloutCheck[]
  guidance: string
}

export type VisualizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingVisualizabilityTableCount: number
  modelRegistryEntriesTableExists: boolean
  modelHealthEventsTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
}

export function evaluateVisualizabilityRollout(
  input: VisualizabilityRolloutInput,
): VisualizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const visualizabilityTableCoverageComplete =
    input.existingVisualizabilityTableCount === CRITICAL_VISUALIZABILITY_TABLES.length

  const checks: VisualizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL visualizability checks can reach the database.'
            : 'Production visualizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'visualizability_signal_table_coverage',
      label: 'Visualizability signal table coverage',
      status: visualizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Visualizability signal table coverage is only enforced in production.'
          : visualizabilityTableCoverageComplete
            ? `${input.existingVisualizabilityTableCount}/${CRITICAL_VISUALIZABILITY_TABLES.length} visualizability signal tables are present.`
            : `${input.existingVisualizabilityTableCount}/${CRITICAL_VISUALIZABILITY_TABLES.length} visualizability signal tables were found.`,
    },
    {
      name: 'model_registry_visualizability',
      label: 'Model registry visualizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry visualizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry visualizability signals.'
            : 'Production visualizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'model_health_visualizability',
      label: 'Model health visualizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health visualizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health visualizability signals.'
            : 'Production visualizability rollout requires a model_health_events table.',
    },
    {
      name: 'visualization_readiness_signal',
      label: 'Visualization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          visualizabilityTableCoverageComplete &&
          input.modelRegistryEntriesTableExists &&
          input.modelHealthEventsTableExists &&
          input.workspaceProviderCredentialsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Visualization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              visualizabilityTableCoverageComplete &&
              input.modelRegistryEntriesTableExists &&
              input.modelHealthEventsTableExists &&
              input.workspaceProviderCredentialsTableExists
            ? 'Model registry entries, model health events, and workspace provider credentials support visualization readiness.'
            : 'Production visualizability rollout requires PostgreSQL connectivity, visualizability tables, model registry visualizability, model health visualizability, and full signal coverage.',
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
        ? 'Production visualizability rollout checks passed. Visualizability coverage and visualization readiness signal signals are healthy.'
        : 'Production visualizability rollout is not ready. Resolve failed checks before relying on production visualizability tooling.',
  }
}

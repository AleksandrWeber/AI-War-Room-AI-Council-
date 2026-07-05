import type { ApiEnv } from '../config/env.js'

export const CRITICAL_MESHABILIZABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type MeshabilizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type MeshabilizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: MeshabilizabilityRolloutCheck[]
  guidance: string
}

export type MeshabilizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingMeshabilizabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateMeshabilizabilityRollout(
  input: MeshabilizabilityRolloutInput,
): MeshabilizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const meshabilizabilityTableCoverageComplete =
    input.existingMeshabilizabilityTableCount === CRITICAL_MESHABILIZABILITY_TABLES.length

  const checks: MeshabilizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL meshabilizability checks can reach the database.'
            : 'Production meshabilizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'meshabilizability_signal_table_coverage',
      label: 'Meshabilizability signal table coverage',
      status: meshabilizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meshabilizability signal table coverage is only enforced in production.'
          : meshabilizabilityTableCoverageComplete
            ? `${input.existingMeshabilizabilityTableCount}/${CRITICAL_MESHABILIZABILITY_TABLES.length} meshabilizability signal tables are present.`
            : `${input.existingMeshabilizabilityTableCount}/${CRITICAL_MESHABILIZABILITY_TABLES.length} meshabilizability signal tables were found.`,
    },
    {
      name: 'model_health_meshabilizability',
      label: 'Model health meshabilizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health meshabilizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health meshabilizability signals.'
            : 'Production meshabilizability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_meshabilizability',
      label: 'Model registry meshabilizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry meshabilizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry meshabilizability signals.'
            : 'Production meshabilizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'meshabilization_readiness_signal',
      label: 'Meshabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          meshabilizabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Meshabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              meshabilizabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support optimization readiness.'
            : 'Production meshabilizability rollout requires PostgreSQL connectivity, meshabilizability tables, model health meshabilizability, model registry meshabilizability, and full signal coverage.',
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
        ? 'Production meshabilizability rollout checks passed. Meshabilizability coverage and meshabilization readiness signal signals are healthy.'
        : 'Production meshabilizability rollout is not ready. Resolve failed checks before relying on production meshabilizability tooling.',
  }
}

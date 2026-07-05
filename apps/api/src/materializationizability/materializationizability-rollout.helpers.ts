import type { ApiEnv } from '../config/env.js'

export const CRITICAL_MATERIALIZATIONIZABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type MaterializationizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type MaterializationizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: MaterializationizabilityRolloutCheck[]
  guidance: string
}

export type MaterializationizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingMaterializationizabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateMaterializationizabilityRollout(
  input: MaterializationizabilityRolloutInput,
): MaterializationizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const materializationizabilityTableCoverageComplete =
    input.existingMaterializationizabilityTableCount === CRITICAL_MATERIALIZATIONIZABILITY_TABLES.length

  const checks: MaterializationizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL materializationizability checks can reach the database.'
            : 'Production materializationizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'materializationizability_signal_table_coverage',
      label: 'Materializationizability signal table coverage',
      status: materializationizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Materializationizability signal table coverage is only enforced in production.'
          : materializationizabilityTableCoverageComplete
            ? `${input.existingMaterializationizabilityTableCount}/${CRITICAL_MATERIALIZATIONIZABILITY_TABLES.length} materializationizability signal tables are present.`
            : `${input.existingMaterializationizabilityTableCount}/${CRITICAL_MATERIALIZATIONIZABILITY_TABLES.length} materializationizability signal tables were found.`,
    },
    {
      name: 'model_health_materializationizability',
      label: 'Model health materializationizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health materializationizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health materializationizability signals.'
            : 'Production materializationizability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_materializationizability',
      label: 'Model registry materializationizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry materializationizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry materializationizability signals.'
            : 'Production materializationizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'materializationization_readiness_signal',
      label: 'Meshabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          materializationizabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Meshabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              materializationizabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support optimization readiness.'
            : 'Production materializationizability rollout requires PostgreSQL connectivity, materializationizability tables, model health materializationizability, model registry materializationizability, and full signal coverage.',
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
        ? 'Production materializationizability rollout checks passed. Materializationizability coverage and meshabilization readiness signal signals are healthy.'
        : 'Production materializationizability rollout is not ready. Resolve failed checks before relying on production materializationizability tooling.',
  }
}

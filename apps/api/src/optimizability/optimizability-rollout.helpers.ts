import type { ApiEnv } from '../config/env.js'

export const CRITICAL_OPTIMIZABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type OptimizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type OptimizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: OptimizabilityRolloutCheck[]
  guidance: string
}

export type OptimizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingOptimizabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateOptimizabilityRollout(
  input: OptimizabilityRolloutInput,
): OptimizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const optimizabilityTableCoverageComplete =
    input.existingOptimizabilityTableCount === CRITICAL_OPTIMIZABILITY_TABLES.length

  const checks: OptimizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL optimizability checks can reach the database.'
            : 'Production optimizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'optimizability_signal_table_coverage',
      label: 'Optimizability signal table coverage',
      status: optimizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Optimizability signal table coverage is only enforced in production.'
          : optimizabilityTableCoverageComplete
            ? `${input.existingOptimizabilityTableCount}/${CRITICAL_OPTIMIZABILITY_TABLES.length} optimizability signal tables are present.`
            : `${input.existingOptimizabilityTableCount}/${CRITICAL_OPTIMIZABILITY_TABLES.length} optimizability signal tables were found.`,
    },
    {
      name: 'model_health_optimizability',
      label: 'Model health optimizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health optimizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health optimizability signals.'
            : 'Production optimizability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_optimizability',
      label: 'Model registry optimizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry optimizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry optimizability signals.'
            : 'Production optimizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'optimizization_readiness_signal',
      label: 'Optimizization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          optimizabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Optimizization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              optimizabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support optimization readiness.'
            : 'Production optimizability rollout requires PostgreSQL connectivity, optimizability tables, model health optimizability, model registry optimizability, and full signal coverage.',
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
        ? 'Production optimizability rollout checks passed. Optimizability coverage and optimizization readiness signal signals are healthy.'
        : 'Production optimizability rollout is not ready. Resolve failed checks before relying on production optimizability tooling.',
  }
}

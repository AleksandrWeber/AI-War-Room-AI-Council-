import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CACHEIZABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type CacheizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CacheizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CacheizabilityRolloutCheck[]
  guidance: string
}

export type CacheizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCacheizabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateCacheizabilityRollout(
  input: CacheizabilityRolloutInput,
): CacheizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const cacheizabilityTableCoverageComplete =
    input.existingCacheizabilityTableCount === CRITICAL_CACHEIZABILITY_TABLES.length

  const checks: CacheizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL cacheizability checks can reach the database.'
            : 'Production cacheizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'cacheizability_signal_table_coverage',
      label: 'Cacheizability signal table coverage',
      status: cacheizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Cacheizability signal table coverage is only enforced in production.'
          : cacheizabilityTableCoverageComplete
            ? `${input.existingCacheizabilityTableCount}/${CRITICAL_CACHEIZABILITY_TABLES.length} cacheizability signal tables are present.`
            : `${input.existingCacheizabilityTableCount}/${CRITICAL_CACHEIZABILITY_TABLES.length} cacheizability signal tables were found.`,
    },
    {
      name: 'model_health_cacheizability',
      label: 'Model health cacheizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health cacheizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health cacheizability signals.'
            : 'Production cacheizability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_cacheizability',
      label: 'Model registry cacheizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry cacheizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry cacheizability signals.'
            : 'Production cacheizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'cacheization_readiness_signal',
      label: 'Meshabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          cacheizabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Meshabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              cacheizabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support optimization readiness.'
            : 'Production cacheizability rollout requires PostgreSQL connectivity, cacheizability tables, model health cacheizability, model registry cacheizability, and full signal coverage.',
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
        ? 'Production cacheizability rollout checks passed. Cacheizability coverage and meshabilization readiness signal signals are healthy.'
        : 'Production cacheizability rollout is not ready. Resolve failed checks before relying on production cacheizability tooling.',
  }
}

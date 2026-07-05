import type { ApiEnv } from '../config/env.js'

export const CRITICAL_INDEXINGIZABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type IndexingizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type IndexingizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: IndexingizabilityRolloutCheck[]
  guidance: string
}

export type IndexingizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingIndexingizabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateIndexingizabilityRollout(
  input: IndexingizabilityRolloutInput,
): IndexingizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const indexingizabilityTableCoverageComplete =
    input.existingIndexingizabilityTableCount === CRITICAL_INDEXINGIZABILITY_TABLES.length

  const checks: IndexingizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL indexingizability checks can reach the database.'
            : 'Production indexingizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'indexingizability_signal_table_coverage',
      label: 'Indexingizability signal table coverage',
      status: indexingizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Indexingizability signal table coverage is only enforced in production.'
          : indexingizabilityTableCoverageComplete
            ? `${input.existingIndexingizabilityTableCount}/${CRITICAL_INDEXINGIZABILITY_TABLES.length} indexingizability signal tables are present.`
            : `${input.existingIndexingizabilityTableCount}/${CRITICAL_INDEXINGIZABILITY_TABLES.length} indexingizability signal tables were found.`,
    },
    {
      name: 'model_health_indexingizability',
      label: 'Model health indexingizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health indexingizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health indexingizability signals.'
            : 'Production indexingizability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_indexingizability',
      label: 'Model registry indexingizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry indexingizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry indexingizability signals.'
            : 'Production indexingizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'indexingization_readiness_signal',
      label: 'Meshabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          indexingizabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Meshabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              indexingizabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support optimization readiness.'
            : 'Production indexingizability rollout requires PostgreSQL connectivity, indexingizability tables, model health indexingizability, model registry indexingizability, and full signal coverage.',
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
        ? 'Production indexingizability rollout checks passed. Indexingizability coverage and meshabilization readiness signal signals are healthy.'
        : 'Production indexingizability rollout is not ready. Resolve failed checks before relying on production indexingizability tooling.',
  }
}

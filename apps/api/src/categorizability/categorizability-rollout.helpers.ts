import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CATEGORIZABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type CategorizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CategorizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CategorizabilityRolloutCheck[]
  guidance: string
}

export type CategorizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCategorizabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateCategorizabilityRollout(
  input: CategorizabilityRolloutInput,
): CategorizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const categorizabilityTableCoverageComplete =
    input.existingCategorizabilityTableCount === CRITICAL_CATEGORIZABILITY_TABLES.length

  const checks: CategorizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL categorizability checks can reach the database.'
            : 'Production categorizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'categorizability_signal_table_coverage',
      label: 'Categorizability signal table coverage',
      status: categorizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Categorizability signal table coverage is only enforced in production.'
          : categorizabilityTableCoverageComplete
            ? `${input.existingCategorizabilityTableCount}/${CRITICAL_CATEGORIZABILITY_TABLES.length} categorizability signal tables are present.`
            : `${input.existingCategorizabilityTableCount}/${CRITICAL_CATEGORIZABILITY_TABLES.length} categorizability signal tables were found.`,
    },
    {
      name: 'model_health_categorizability',
      label: 'Model health categorizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health categorizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health categorizability signals.'
            : 'Production categorizability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_categorizability',
      label: 'Model registry categorizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry categorizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry categorizability signals.'
            : 'Production categorizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'categorization_readiness_signal',
      label: 'Categorization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          categorizabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Categorization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              categorizabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support categorization readiness.'
            : 'Production categorizability rollout requires PostgreSQL connectivity, categorizability tables, model health categorizability, model registry categorizability, and full signal coverage.',
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
        ? 'Production categorizability rollout checks passed. Categorizability coverage and categorization readiness signal signals are healthy.'
        : 'Production categorizability rollout is not ready. Resolve failed checks before relying on production categorizability tooling.',
  }
}

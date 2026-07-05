import type { ApiEnv } from '../config/env.js'

export const CRITICAL_FEATUREFLAGIZABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type FeatureflagizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type FeatureflagizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: FeatureflagizabilityRolloutCheck[]
  guidance: string
}

export type FeatureflagizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingFeatureflagizabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateFeatureflagizabilityRollout(
  input: FeatureflagizabilityRolloutInput,
): FeatureflagizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const featureflagizabilityTableCoverageComplete =
    input.existingFeatureflagizabilityTableCount === CRITICAL_FEATUREFLAGIZABILITY_TABLES.length

  const checks: FeatureflagizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL featureflagizability checks can reach the database.'
            : 'Production featureflagizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'featureflagizability_signal_table_coverage',
      label: 'Featureflagizability signal table coverage',
      status: featureflagizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Featureflagizability signal table coverage is only enforced in production.'
          : featureflagizabilityTableCoverageComplete
            ? `${input.existingFeatureflagizabilityTableCount}/${CRITICAL_FEATUREFLAGIZABILITY_TABLES.length} featureflagizability signal tables are present.`
            : `${input.existingFeatureflagizabilityTableCount}/${CRITICAL_FEATUREFLAGIZABILITY_TABLES.length} featureflagizability signal tables were found.`,
    },
    {
      name: 'model_health_featureflagizability',
      label: 'Model health featureflagizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health featureflagizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health featureflagizability signals.'
            : 'Production featureflagizability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_featureflagizability',
      label: 'Model registry featureflagizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry featureflagizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry featureflagizability signals.'
            : 'Production featureflagizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'featureflagization_readiness_signal',
      label: 'Featureflagization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          featureflagizabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Featureflagization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              featureflagizabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support optimization readiness.'
            : 'Production featureflagizability rollout requires PostgreSQL connectivity, featureflagizability tables, model health featureflagizability, model registry featureflagizability, and full signal coverage.',
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
        ? 'Production featureflagizability rollout checks passed. Featureflagizability coverage and featureflagization readiness signal signals are healthy.'
        : 'Production featureflagizability rollout is not ready. Resolve failed checks before relying on production featureflagizability tooling.',
  }
}

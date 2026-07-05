import type { ApiEnv } from '../config/env.js'

export const CRITICAL_NORMALIZABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type NormalizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type NormalizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: NormalizabilityRolloutCheck[]
  guidance: string
}

export type NormalizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingNormalizabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateNormalizabilityRollout(
  input: NormalizabilityRolloutInput,
): NormalizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const normalizabilityTableCoverageComplete =
    input.existingNormalizabilityTableCount === CRITICAL_NORMALIZABILITY_TABLES.length

  const checks: NormalizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL normalizability checks can reach the database.'
            : 'Production normalizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'normalizability_signal_table_coverage',
      label: 'Normalizability signal table coverage',
      status: normalizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Normalizability signal table coverage is only enforced in production.'
          : normalizabilityTableCoverageComplete
            ? `${input.existingNormalizabilityTableCount}/${CRITICAL_NORMALIZABILITY_TABLES.length} normalizability signal tables are present.`
            : `${input.existingNormalizabilityTableCount}/${CRITICAL_NORMALIZABILITY_TABLES.length} normalizability signal tables were found.`,
    },
    {
      name: 'model_health_normalizability',
      label: 'Model health normalizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health normalizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health normalizability signals.'
            : 'Production normalizability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_normalizability',
      label: 'Model registry normalizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry normalizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry normalizability signals.'
            : 'Production normalizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'normalization_readiness_signal',
      label: 'Normalization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          normalizabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Normalization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              normalizabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support normalization readiness.'
            : 'Production normalizability rollout requires PostgreSQL connectivity, normalizability tables, model health normalizability, model registry normalizability, and full signal coverage.',
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
        ? 'Production normalizability rollout checks passed. Normalizability coverage and normalization readiness signal signals are healthy.'
        : 'Production normalizability rollout is not ready. Resolve failed checks before relying on production normalizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_EVOCATABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type EvocatabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type EvocatabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: EvocatabilityRolloutCheck[]
  guidance: string
}

export type EvocatabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingEvocatabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateEvocatabilityRollout(
  input: EvocatabilityRolloutInput,
): EvocatabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const evocatabilityTableCoverageComplete =
    input.existingEvocatabilityTableCount === CRITICAL_EVOCATABILITY_TABLES.length

  const checks: EvocatabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL evocatability checks can reach the database.'
            : 'Production evocatability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'evocatability_signal_table_coverage',
      label: 'Evocatability signal table coverage',
      status: evocatabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Evocatability signal table coverage is only enforced in production.'
          : evocatabilityTableCoverageComplete
            ? `${input.existingEvocatabilityTableCount}/${CRITICAL_EVOCATABILITY_TABLES.length} evocatability signal tables are present.`
            : `${input.existingEvocatabilityTableCount}/${CRITICAL_EVOCATABILITY_TABLES.length} evocatability signal tables were found.`,
    },
    {
      name: 'model_health_evocatability',
      label: 'Model health evocatability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health evocatability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health evocatability signals.'
            : 'Production evocatability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_evocatability',
      label: 'Model registry evocatability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry evocatability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry evocatability signals.'
            : 'Production evocatability rollout requires a model_registry_entries table.',
    },
    {
      name: 'evocation_readiness_signal',
      label: 'Evocation readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          evocatabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Evocation readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              evocatabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support evocation readiness.'
            : 'Production evocatability rollout requires PostgreSQL connectivity, evocatability tables, model health evocatability, model registry evocatability, and full signal coverage.',
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
        ? 'Production evocatability rollout checks passed. Evocatability coverage and evocation readiness signal signals are healthy.'
        : 'Production evocatability rollout is not ready. Resolve failed checks before relying on production evocatability tooling.',
  }
}

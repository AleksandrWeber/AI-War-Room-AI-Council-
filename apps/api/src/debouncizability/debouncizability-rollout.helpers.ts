import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DEBOUNCIZABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type DebouncizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DebouncizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DebouncizabilityRolloutCheck[]
  guidance: string
}

export type DebouncizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDebouncizabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateDebouncizabilityRollout(
  input: DebouncizabilityRolloutInput,
): DebouncizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const debouncizabilityTableCoverageComplete =
    input.existingDebouncizabilityTableCount === CRITICAL_DEBOUNCIZABILITY_TABLES.length

  const checks: DebouncizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL debouncizability checks can reach the database.'
            : 'Production debouncizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'debouncizability_signal_table_coverage',
      label: 'Debouncizability signal table coverage',
      status: debouncizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Debouncizability signal table coverage is only enforced in production.'
          : debouncizabilityTableCoverageComplete
            ? `${input.existingDebouncizabilityTableCount}/${CRITICAL_DEBOUNCIZABILITY_TABLES.length} debouncizability signal tables are present.`
            : `${input.existingDebouncizabilityTableCount}/${CRITICAL_DEBOUNCIZABILITY_TABLES.length} debouncizability signal tables were found.`,
    },
    {
      name: 'model_health_debouncizability',
      label: 'Model health debouncizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health debouncizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health debouncizability signals.'
            : 'Production debouncizability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_debouncizability',
      label: 'Model registry debouncizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry debouncizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry debouncizability signals.'
            : 'Production debouncizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'debouncization_readiness_signal',
      label: 'Meshabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          debouncizabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Meshabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              debouncizabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support optimization readiness.'
            : 'Production debouncizability rollout requires PostgreSQL connectivity, debouncizability tables, model health debouncizability, model registry debouncizability, and full signal coverage.',
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
        ? 'Production debouncizability rollout checks passed. Debouncizability coverage and meshabilization readiness signal signals are healthy.'
        : 'Production debouncizability rollout is not ready. Resolve failed checks before relying on production debouncizability tooling.',
  }
}

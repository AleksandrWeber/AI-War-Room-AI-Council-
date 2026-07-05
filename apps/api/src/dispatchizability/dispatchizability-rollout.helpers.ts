import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DISPATCHIZABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type DispatchizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DispatchizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DispatchizabilityRolloutCheck[]
  guidance: string
}

export type DispatchizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDispatchizabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateDispatchizabilityRollout(
  input: DispatchizabilityRolloutInput,
): DispatchizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const dispatchizabilityTableCoverageComplete =
    input.existingDispatchizabilityTableCount === CRITICAL_DISPATCHIZABILITY_TABLES.length

  const checks: DispatchizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL dispatchizability checks can reach the database.'
            : 'Production dispatchizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'dispatchizability_signal_table_coverage',
      label: 'Dispatchizability signal table coverage',
      status: dispatchizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Dispatchizability signal table coverage is only enforced in production.'
          : dispatchizabilityTableCoverageComplete
            ? `${input.existingDispatchizabilityTableCount}/${CRITICAL_DISPATCHIZABILITY_TABLES.length} dispatchizability signal tables are present.`
            : `${input.existingDispatchizabilityTableCount}/${CRITICAL_DISPATCHIZABILITY_TABLES.length} dispatchizability signal tables were found.`,
    },
    {
      name: 'model_health_dispatchizability',
      label: 'Model health dispatchizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health dispatchizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health dispatchizability signals.'
            : 'Production dispatchizability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_dispatchizability',
      label: 'Model registry dispatchizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry dispatchizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry dispatchizability signals.'
            : 'Production dispatchizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'dispatchization_readiness_signal',
      label: 'Meshabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          dispatchizabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Meshabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              dispatchizabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support optimization readiness.'
            : 'Production dispatchizability rollout requires PostgreSQL connectivity, dispatchizability tables, model health dispatchizability, model registry dispatchizability, and full signal coverage.',
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
        ? 'Production dispatchizability rollout checks passed. Dispatchizability coverage and meshabilization readiness signal signals are healthy.'
        : 'Production dispatchizability rollout is not ready. Resolve failed checks before relying on production dispatchizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PIVOTIZABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type PivotizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type PivotizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: PivotizabilityRolloutCheck[]
  guidance: string
}

export type PivotizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingPivotizabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluatePivotizabilityRollout(
  input: PivotizabilityRolloutInput,
): PivotizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const pivotizabilityTableCoverageComplete =
    input.existingPivotizabilityTableCount === CRITICAL_PIVOTIZABILITY_TABLES.length

  const checks: PivotizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL pivotizability checks can reach the database.'
            : 'Production pivotizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'pivotizability_signal_table_coverage',
      label: 'Pivotizability signal table coverage',
      status: pivotizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Pivotizability signal table coverage is only enforced in production.'
          : pivotizabilityTableCoverageComplete
            ? `${input.existingPivotizabilityTableCount}/${CRITICAL_PIVOTIZABILITY_TABLES.length} pivotizability signal tables are present.`
            : `${input.existingPivotizabilityTableCount}/${CRITICAL_PIVOTIZABILITY_TABLES.length} pivotizability signal tables were found.`,
    },
    {
      name: 'model_health_pivotizability',
      label: 'Model health pivotizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health pivotizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health pivotizability signals.'
            : 'Production pivotizability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_pivotizability',
      label: 'Model registry pivotizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry pivotizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry pivotizability signals.'
            : 'Production pivotizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'pivotization_readiness_signal',
      label: 'Meshabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          pivotizabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Meshabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              pivotizabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support optimization readiness.'
            : 'Production pivotizability rollout requires PostgreSQL connectivity, pivotizability tables, model health pivotizability, model registry pivotizability, and full signal coverage.',
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
        ? 'Production pivotizability rollout checks passed. Pivotizability coverage and meshabilization readiness signal signals are healthy.'
        : 'Production pivotizability rollout is not ready. Resolve failed checks before relying on production pivotizability tooling.',
  }
}

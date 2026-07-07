import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DEALLOCATIONIZABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type DeallocationizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DeallocationizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DeallocationizabilityRolloutCheck[]
  guidance: string
}

export type DeallocationizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDeallocationizabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateDeallocationizabilityRollout(
  input: DeallocationizabilityRolloutInput,
): DeallocationizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const deallocationizabilityTableCoverageComplete =
    input.existingDeallocationizabilityTableCount === CRITICAL_DEALLOCATIONIZABILITY_TABLES.length

  const checks: DeallocationizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL deallocationizability checks can reach the database.'
            : 'Production deallocationizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'deallocationizability_signal_table_coverage',
      label: 'Deallocationizability signal table coverage',
      status: deallocationizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Deallocationizability signal table coverage is only enforced in production.'
          : deallocationizabilityTableCoverageComplete
            ? `${input.existingDeallocationizabilityTableCount}/${CRITICAL_DEALLOCATIONIZABILITY_TABLES.length} deallocationizability signal tables are present.`
            : `${input.existingDeallocationizabilityTableCount}/${CRITICAL_DEALLOCATIONIZABILITY_TABLES.length} deallocationizability signal tables were found.`,
    },
    {
      name: 'model_health_deallocationizability',
      label: 'Model health deallocationizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health deallocationizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health deallocationizability signals.'
            : 'Production deallocationizability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_deallocationizability',
      label: 'Model registry deallocationizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry deallocationizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry deallocationizability signals.'
            : 'Production deallocationizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'deallocationization_readiness_signal',
      label: 'Meshabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          deallocationizabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Meshabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              deallocationizabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support optimization readiness.'
            : 'Production deallocationizability rollout requires PostgreSQL connectivity, deallocationizability tables, model health deallocationizability, model registry deallocationizability, and full signal coverage.',
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
        ? 'Production deallocationizability rollout checks passed. Deallocationizability coverage and meshabilization readiness signal signals are healthy.'
        : 'Production deallocationizability rollout is not ready. Resolve failed checks before relying on production deallocationizability tooling.',
  }
}

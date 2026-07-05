import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ADAPTIZABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type AdaptizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AdaptizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AdaptizabilityRolloutCheck[]
  guidance: string
}

export type AdaptizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAdaptizabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateAdaptizabilityRollout(
  input: AdaptizabilityRolloutInput,
): AdaptizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const adaptizabilityTableCoverageComplete =
    input.existingAdaptizabilityTableCount === CRITICAL_ADAPTIZABILITY_TABLES.length

  const checks: AdaptizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL adaptizability checks can reach the database.'
            : 'Production adaptizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'adaptizability_signal_table_coverage',
      label: 'Adaptizability signal table coverage',
      status: adaptizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Adaptizability signal table coverage is only enforced in production.'
          : adaptizabilityTableCoverageComplete
            ? `${input.existingAdaptizabilityTableCount}/${CRITICAL_ADAPTIZABILITY_TABLES.length} adaptizability signal tables are present.`
            : `${input.existingAdaptizabilityTableCount}/${CRITICAL_ADAPTIZABILITY_TABLES.length} adaptizability signal tables were found.`,
    },
    {
      name: 'model_health_adaptizability',
      label: 'Model health adaptizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health adaptizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health adaptizability signals.'
            : 'Production adaptizability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_adaptizability',
      label: 'Model registry adaptizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry adaptizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry adaptizability signals.'
            : 'Production adaptizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'adaptization_readiness_signal',
      label: 'Adaptization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          adaptizabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Adaptization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              adaptizabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support optimization readiness.'
            : 'Production adaptizability rollout requires PostgreSQL connectivity, adaptizability tables, model health adaptizability, model registry adaptizability, and full signal coverage.',
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
        ? 'Production adaptizability rollout checks passed. Adaptizability coverage and adaptization readiness signal signals are healthy.'
        : 'Production adaptizability rollout is not ready. Resolve failed checks before relying on production adaptizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_EXTRAPOLIZABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type ExtrapolizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ExtrapolizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ExtrapolizabilityRolloutCheck[]
  guidance: string
}

export type ExtrapolizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingExtrapolizabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateExtrapolizabilityRollout(
  input: ExtrapolizabilityRolloutInput,
): ExtrapolizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const extrapolizabilityTableCoverageComplete =
    input.existingExtrapolizabilityTableCount === CRITICAL_EXTRAPOLIZABILITY_TABLES.length

  const checks: ExtrapolizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL extrapolizability checks can reach the database.'
            : 'Production extrapolizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'extrapolizability_signal_table_coverage',
      label: 'Extrapolizability signal table coverage',
      status: extrapolizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Extrapolizability signal table coverage is only enforced in production.'
          : extrapolizabilityTableCoverageComplete
            ? `${input.existingExtrapolizabilityTableCount}/${CRITICAL_EXTRAPOLIZABILITY_TABLES.length} extrapolizability signal tables are present.`
            : `${input.existingExtrapolizabilityTableCount}/${CRITICAL_EXTRAPOLIZABILITY_TABLES.length} extrapolizability signal tables were found.`,
    },
    {
      name: 'model_health_extrapolizability',
      label: 'Model health extrapolizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health extrapolizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health extrapolizability signals.'
            : 'Production extrapolizability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_extrapolizability',
      label: 'Model registry extrapolizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry extrapolizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry extrapolizability signals.'
            : 'Production extrapolizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'extrapolization_readiness_signal',
      label: 'Extrapolization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          extrapolizabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Extrapolization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              extrapolizabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support extrapolization readiness.'
            : 'Production extrapolizability rollout requires PostgreSQL connectivity, extrapolizability tables, model health extrapolizability, model registry extrapolizability, and full signal coverage.',
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
        ? 'Production extrapolizability rollout checks passed. Extrapolizability coverage and extrapolization readiness signal signals are healthy.'
        : 'Production extrapolizability rollout is not ready. Resolve failed checks before relying on production extrapolizability tooling.',
  }
}

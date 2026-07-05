import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SUSTAINIZABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type SustainizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SustainizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SustainizabilityRolloutCheck[]
  guidance: string
}

export type SustainizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSustainizabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateSustainizabilityRollout(
  input: SustainizabilityRolloutInput,
): SustainizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const sustainizabilityTableCoverageComplete =
    input.existingSustainizabilityTableCount === CRITICAL_SUSTAINIZABILITY_TABLES.length

  const checks: SustainizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL sustainizability checks can reach the database.'
            : 'Production sustainizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'sustainizability_signal_table_coverage',
      label: 'Sustainizability signal table coverage',
      status: sustainizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Sustainizability signal table coverage is only enforced in production.'
          : sustainizabilityTableCoverageComplete
            ? `${input.existingSustainizabilityTableCount}/${CRITICAL_SUSTAINIZABILITY_TABLES.length} sustainizability signal tables are present.`
            : `${input.existingSustainizabilityTableCount}/${CRITICAL_SUSTAINIZABILITY_TABLES.length} sustainizability signal tables were found.`,
    },
    {
      name: 'model_health_sustainizability',
      label: 'Model health sustainizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health sustainizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health sustainizability signals.'
            : 'Production sustainizability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_sustainizability',
      label: 'Model registry sustainizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry sustainizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry sustainizability signals.'
            : 'Production sustainizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'sustainization_readiness_signal',
      label: 'Sustainization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          sustainizabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sustainization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              sustainizabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support optimization readiness.'
            : 'Production sustainizability rollout requires PostgreSQL connectivity, sustainizability tables, model health sustainizability, model registry sustainizability, and full signal coverage.',
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
        ? 'Production sustainizability rollout checks passed. Sustainizability coverage and sustainization readiness signal signals are healthy.'
        : 'Production sustainizability rollout is not ready. Resolve failed checks before relying on production sustainizability tooling.',
  }
}

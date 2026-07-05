import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ASSESSABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type AssessabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AssessabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AssessabilityRolloutCheck[]
  guidance: string
}

export type AssessabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAssessabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateAssessabilityRollout(
  input: AssessabilityRolloutInput,
): AssessabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const assessabilityTableCoverageComplete =
    input.existingAssessabilityTableCount === CRITICAL_ASSESSABILITY_TABLES.length

  const checks: AssessabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL assessability checks can reach the database.'
            : 'Production assessability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'assessability_signal_table_coverage',
      label: 'Assessability signal table coverage',
      status: assessabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Assessability signal table coverage is only enforced in production.'
          : assessabilityTableCoverageComplete
            ? `${input.existingAssessabilityTableCount}/${CRITICAL_ASSESSABILITY_TABLES.length} assessability signal tables are present.`
            : `${input.existingAssessabilityTableCount}/${CRITICAL_ASSESSABILITY_TABLES.length} assessability signal tables were found.`,
    },
    {
      name: 'model_health_assessability',
      label: 'Model health assessability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health assessability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health assessability signals.'
            : 'Production assessability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_assessability',
      label: 'Model registry assessability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry assessability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry assessability signals.'
            : 'Production assessability rollout requires a model_registry_entries table.',
    },
    {
      name: 'evaluation_readiness_signal',
      label: 'Evaluation readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          assessabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Evaluation readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              assessabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support evaluation readiness.'
            : 'Production assessability rollout requires PostgreSQL connectivity, assessability tables, model health assessability, model registry assessability, and full signal coverage.',
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
        ? 'Production assessability rollout checks passed. Assessability coverage and evaluation readiness signal signals are healthy.'
        : 'Production assessability rollout is not ready. Resolve failed checks before relying on production assessability tooling.',
  }
}

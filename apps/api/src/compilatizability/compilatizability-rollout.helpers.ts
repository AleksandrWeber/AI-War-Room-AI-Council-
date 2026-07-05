import type { ApiEnv } from '../config/env.js'

export const CRITICAL_COMPILATIZABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type CompilatizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CompilatizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CompilatizabilityRolloutCheck[]
  guidance: string
}

export type CompilatizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCompilatizabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateCompilatizabilityRollout(
  input: CompilatizabilityRolloutInput,
): CompilatizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const compilatizabilityTableCoverageComplete =
    input.existingCompilatizabilityTableCount === CRITICAL_COMPILATIZABILITY_TABLES.length

  const checks: CompilatizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL compilatizability checks can reach the database.'
            : 'Production compilatizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'compilatizability_signal_table_coverage',
      label: 'Compilatizability signal table coverage',
      status: compilatizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Compilatizability signal table coverage is only enforced in production.'
          : compilatizabilityTableCoverageComplete
            ? `${input.existingCompilatizabilityTableCount}/${CRITICAL_COMPILATIZABILITY_TABLES.length} compilatizability signal tables are present.`
            : `${input.existingCompilatizabilityTableCount}/${CRITICAL_COMPILATIZABILITY_TABLES.length} compilatizability signal tables were found.`,
    },
    {
      name: 'model_health_compilatizability',
      label: 'Model health compilatizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health compilatizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health compilatizability signals.'
            : 'Production compilatizability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_compilatizability',
      label: 'Model registry compilatizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry compilatizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry compilatizability signals.'
            : 'Production compilatizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'compilatization_readiness_signal',
      label: 'Compilatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          compilatizabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Compilatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              compilatizabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support compilatization readiness.'
            : 'Production compilatizability rollout requires PostgreSQL connectivity, compilatizability tables, model health compilatizability, model registry compilatizability, and full signal coverage.',
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
        ? 'Production compilatizability rollout checks passed. Compilatizability coverage and compilatization readiness signal signals are healthy.'
        : 'Production compilatizability rollout is not ready. Resolve failed checks before relying on production compilatizability tooling.',
  }
}

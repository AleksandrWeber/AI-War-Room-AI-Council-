import type { ApiEnv } from '../config/env.js'

export const CRITICAL_HERMETICIZABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type HermeticizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type HermeticizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: HermeticizabilityRolloutCheck[]
  guidance: string
}

export type HermeticizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingHermeticizabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateHermeticizabilityRollout(
  input: HermeticizabilityRolloutInput,
): HermeticizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const hermeticizabilityTableCoverageComplete =
    input.existingHermeticizabilityTableCount === CRITICAL_HERMETICIZABILITY_TABLES.length

  const checks: HermeticizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL hermeticizability checks can reach the database.'
            : 'Production hermeticizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'hermeticizability_signal_table_coverage',
      label: 'Hermeticizability signal table coverage',
      status: hermeticizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Hermeticizability signal table coverage is only enforced in production.'
          : hermeticizabilityTableCoverageComplete
            ? `${input.existingHermeticizabilityTableCount}/${CRITICAL_HERMETICIZABILITY_TABLES.length} hermeticizability signal tables are present.`
            : `${input.existingHermeticizabilityTableCount}/${CRITICAL_HERMETICIZABILITY_TABLES.length} hermeticizability signal tables were found.`,
    },
    {
      name: 'model_health_hermeticizability',
      label: 'Model health hermeticizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health hermeticizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health hermeticizability signals.'
            : 'Production hermeticizability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_hermeticizability',
      label: 'Model registry hermeticizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry hermeticizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry hermeticizability signals.'
            : 'Production hermeticizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'hermeticization_readiness_signal',
      label: 'Hermeticization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          hermeticizabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Hermeticization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              hermeticizabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support hermeticization readiness.'
            : 'Production hermeticizability rollout requires PostgreSQL connectivity, hermeticizability tables, model health hermeticizability, model registry hermeticizability, and full signal coverage.',
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
        ? 'Production hermeticizability rollout checks passed. Hermeticizability coverage and hermeticization readiness signal signals are healthy.'
        : 'Production hermeticizability rollout is not ready. Resolve failed checks before relying on production hermeticizability tooling.',
  }
}

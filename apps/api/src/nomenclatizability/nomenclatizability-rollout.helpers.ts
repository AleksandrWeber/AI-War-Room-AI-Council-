import type { ApiEnv } from '../config/env.js'

export const CRITICAL_NOMENCLATIZABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type NomenclatizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type NomenclatizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: NomenclatizabilityRolloutCheck[]
  guidance: string
}

export type NomenclatizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingNomenclatizabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateNomenclatizabilityRollout(
  input: NomenclatizabilityRolloutInput,
): NomenclatizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const nomenclatizabilityTableCoverageComplete =
    input.existingNomenclatizabilityTableCount === CRITICAL_NOMENCLATIZABILITY_TABLES.length

  const checks: NomenclatizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL nomenclatizability checks can reach the database.'
            : 'Production nomenclatizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'nomenclatizability_signal_table_coverage',
      label: 'Nomenclatizability signal table coverage',
      status: nomenclatizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Nomenclatizability signal table coverage is only enforced in production.'
          : nomenclatizabilityTableCoverageComplete
            ? `${input.existingNomenclatizabilityTableCount}/${CRITICAL_NOMENCLATIZABILITY_TABLES.length} nomenclatizability signal tables are present.`
            : `${input.existingNomenclatizabilityTableCount}/${CRITICAL_NOMENCLATIZABILITY_TABLES.length} nomenclatizability signal tables were found.`,
    },
    {
      name: 'model_health_nomenclatizability',
      label: 'Model health nomenclatizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health nomenclatizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health nomenclatizability signals.'
            : 'Production nomenclatizability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_nomenclatizability',
      label: 'Model registry nomenclatizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry nomenclatizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry nomenclatizability signals.'
            : 'Production nomenclatizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'nomenclatization_readiness_signal',
      label: 'Nomenclatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          nomenclatizabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Nomenclatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              nomenclatizabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support nomenclatization readiness.'
            : 'Production nomenclatizability rollout requires PostgreSQL connectivity, nomenclatizability tables, model health nomenclatizability, model registry nomenclatizability, and full signal coverage.',
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
        ? 'Production nomenclatizability rollout checks passed. Nomenclatizability coverage and nomenclatization readiness signal signals are healthy.'
        : 'Production nomenclatizability rollout is not ready. Resolve failed checks before relying on production nomenclatizability tooling.',
  }
}

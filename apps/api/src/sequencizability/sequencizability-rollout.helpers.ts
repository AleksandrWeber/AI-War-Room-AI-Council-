import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SEQUENCIZABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type SequencizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SequencizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SequencizabilityRolloutCheck[]
  guidance: string
}

export type SequencizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSequencizabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateSequencizabilityRollout(
  input: SequencizabilityRolloutInput,
): SequencizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const sequencizabilityTableCoverageComplete =
    input.existingSequencizabilityTableCount === CRITICAL_SEQUENCIZABILITY_TABLES.length

  const checks: SequencizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL sequencizability checks can reach the database.'
            : 'Production sequencizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'sequencizability_signal_table_coverage',
      label: 'Sequencizability signal table coverage',
      status: sequencizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Sequencizability signal table coverage is only enforced in production.'
          : sequencizabilityTableCoverageComplete
            ? `${input.existingSequencizabilityTableCount}/${CRITICAL_SEQUENCIZABILITY_TABLES.length} sequencizability signal tables are present.`
            : `${input.existingSequencizabilityTableCount}/${CRITICAL_SEQUENCIZABILITY_TABLES.length} sequencizability signal tables were found.`,
    },
    {
      name: 'model_health_sequencizability',
      label: 'Model health sequencizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health sequencizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health sequencizability signals.'
            : 'Production sequencizability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_sequencizability',
      label: 'Model registry sequencizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry sequencizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry sequencizability signals.'
            : 'Production sequencizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'sequencization_readiness_signal',
      label: 'Meshabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          sequencizabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Meshabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              sequencizabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support optimization readiness.'
            : 'Production sequencizability rollout requires PostgreSQL connectivity, sequencizability tables, model health sequencizability, model registry sequencizability, and full signal coverage.',
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
        ? 'Production sequencizability rollout checks passed. Sequencizability coverage and meshabilization readiness signal signals are healthy.'
        : 'Production sequencizability rollout is not ready. Resolve failed checks before relying on production sequencizability tooling.',
  }
}

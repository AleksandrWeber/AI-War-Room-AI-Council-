import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CONSENSUSIZABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type ConsensusizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ConsensusizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ConsensusizabilityRolloutCheck[]
  guidance: string
}

export type ConsensusizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingConsensusizabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateConsensusizabilityRollout(
  input: ConsensusizabilityRolloutInput,
): ConsensusizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const consensusizabilityTableCoverageComplete =
    input.existingConsensusizabilityTableCount === CRITICAL_CONSENSUSIZABILITY_TABLES.length

  const checks: ConsensusizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL consensusizability checks can reach the database.'
            : 'Production consensusizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'consensusizability_signal_table_coverage',
      label: 'Consensusizability signal table coverage',
      status: consensusizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Consensusizability signal table coverage is only enforced in production.'
          : consensusizabilityTableCoverageComplete
            ? `${input.existingConsensusizabilityTableCount}/${CRITICAL_CONSENSUSIZABILITY_TABLES.length} consensusizability signal tables are present.`
            : `${input.existingConsensusizabilityTableCount}/${CRITICAL_CONSENSUSIZABILITY_TABLES.length} consensusizability signal tables were found.`,
    },
    {
      name: 'model_health_consensusizability',
      label: 'Model health consensusizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health consensusizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health consensusizability signals.'
            : 'Production consensusizability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_consensusizability',
      label: 'Model registry consensusizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry consensusizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry consensusizability signals.'
            : 'Production consensusizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'consensusization_readiness_signal',
      label: 'Meshabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          consensusizabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Meshabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              consensusizabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support optimization readiness.'
            : 'Production consensusizability rollout requires PostgreSQL connectivity, consensusizability tables, model health consensusizability, model registry consensusizability, and full signal coverage.',
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
        ? 'Production consensusizability rollout checks passed. Consensusizability coverage and meshabilization readiness signal signals are healthy.'
        : 'Production consensusizability rollout is not ready. Resolve failed checks before relying on production consensusizability tooling.',
  }
}

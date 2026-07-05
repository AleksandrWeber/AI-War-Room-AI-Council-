import type { ApiEnv } from '../config/env.js'

export const CRITICAL_RELAYIZABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type RelayizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RelayizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RelayizabilityRolloutCheck[]
  guidance: string
}

export type RelayizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRelayizabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateRelayizabilityRollout(
  input: RelayizabilityRolloutInput,
): RelayizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const relayizabilityTableCoverageComplete =
    input.existingRelayizabilityTableCount === CRITICAL_RELAYIZABILITY_TABLES.length

  const checks: RelayizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL relayizability checks can reach the database.'
            : 'Production relayizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'relayizability_signal_table_coverage',
      label: 'Relayizability signal table coverage',
      status: relayizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Relayizability signal table coverage is only enforced in production.'
          : relayizabilityTableCoverageComplete
            ? `${input.existingRelayizabilityTableCount}/${CRITICAL_RELAYIZABILITY_TABLES.length} relayizability signal tables are present.`
            : `${input.existingRelayizabilityTableCount}/${CRITICAL_RELAYIZABILITY_TABLES.length} relayizability signal tables were found.`,
    },
    {
      name: 'model_health_relayizability',
      label: 'Model health relayizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health relayizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health relayizability signals.'
            : 'Production relayizability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_relayizability',
      label: 'Model registry relayizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry relayizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry relayizability signals.'
            : 'Production relayizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'relayization_readiness_signal',
      label: 'Meshabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          relayizabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Meshabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              relayizabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support optimization readiness.'
            : 'Production relayizability rollout requires PostgreSQL connectivity, relayizability tables, model health relayizability, model registry relayizability, and full signal coverage.',
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
        ? 'Production relayizability rollout checks passed. Relayizability coverage and meshabilization readiness signal signals are healthy.'
        : 'Production relayizability rollout is not ready. Resolve failed checks before relying on production relayizability tooling.',
  }
}

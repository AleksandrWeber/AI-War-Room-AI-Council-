import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PROTOCOLIZABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type ProtocolizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ProtocolizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ProtocolizabilityRolloutCheck[]
  guidance: string
}

export type ProtocolizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingProtocolizabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateProtocolizabilityRollout(
  input: ProtocolizabilityRolloutInput,
): ProtocolizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const protocolizabilityTableCoverageComplete =
    input.existingProtocolizabilityTableCount === CRITICAL_PROTOCOLIZABILITY_TABLES.length

  const checks: ProtocolizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL protocolizability checks can reach the database.'
            : 'Production protocolizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'protocolizability_signal_table_coverage',
      label: 'Protocolizability signal table coverage',
      status: protocolizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Protocolizability signal table coverage is only enforced in production.'
          : protocolizabilityTableCoverageComplete
            ? `${input.existingProtocolizabilityTableCount}/${CRITICAL_PROTOCOLIZABILITY_TABLES.length} protocolizability signal tables are present.`
            : `${input.existingProtocolizabilityTableCount}/${CRITICAL_PROTOCOLIZABILITY_TABLES.length} protocolizability signal tables were found.`,
    },
    {
      name: 'model_health_protocolizability',
      label: 'Model health protocolizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health protocolizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health protocolizability signals.'
            : 'Production protocolizability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_protocolizability',
      label: 'Model registry protocolizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry protocolizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry protocolizability signals.'
            : 'Production protocolizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'protocolization_readiness_signal',
      label: 'Protocolization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          protocolizabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Protocolization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              protocolizabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support optimization readiness.'
            : 'Production protocolizability rollout requires PostgreSQL connectivity, protocolizability tables, model health protocolizability, model registry protocolizability, and full signal coverage.',
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
        ? 'Production protocolizability rollout checks passed. Protocolizability coverage and protocolization readiness signal signals are healthy.'
        : 'Production protocolizability rollout is not ready. Resolve failed checks before relying on production protocolizability tooling.',
  }
}

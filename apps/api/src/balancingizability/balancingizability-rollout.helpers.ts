import type { ApiEnv } from '../config/env.js'

export const CRITICAL_BALANCINGIZABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type BalancingizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type BalancingizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: BalancingizabilityRolloutCheck[]
  guidance: string
}

export type BalancingizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingBalancingizabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateBalancingizabilityRollout(
  input: BalancingizabilityRolloutInput,
): BalancingizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const balancingizabilityTableCoverageComplete =
    input.existingBalancingizabilityTableCount === CRITICAL_BALANCINGIZABILITY_TABLES.length

  const checks: BalancingizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL balancingizability checks can reach the database.'
            : 'Production balancingizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'balancingizability_signal_table_coverage',
      label: 'Balancingizability signal table coverage',
      status: balancingizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Balancingizability signal table coverage is only enforced in production.'
          : balancingizabilityTableCoverageComplete
            ? `${input.existingBalancingizabilityTableCount}/${CRITICAL_BALANCINGIZABILITY_TABLES.length} balancingizability signal tables are present.`
            : `${input.existingBalancingizabilityTableCount}/${CRITICAL_BALANCINGIZABILITY_TABLES.length} balancingizability signal tables were found.`,
    },
    {
      name: 'model_health_balancingizability',
      label: 'Model health balancingizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health balancingizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health balancingizability signals.'
            : 'Production balancingizability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_balancingizability',
      label: 'Model registry balancingizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry balancingizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry balancingizability signals.'
            : 'Production balancingizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'balancingization_readiness_signal',
      label: 'Meshabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          balancingizabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Meshabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              balancingizabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support optimization readiness.'
            : 'Production balancingizability rollout requires PostgreSQL connectivity, balancingizability tables, model health balancingizability, model registry balancingizability, and full signal coverage.',
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
        ? 'Production balancingizability rollout checks passed. Balancingizability coverage and meshabilization readiness signal signals are healthy.'
        : 'Production balancingizability rollout is not ready. Resolve failed checks before relying on production balancingizability tooling.',
  }
}

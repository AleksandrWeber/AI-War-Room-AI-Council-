import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CANONICALIZABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type CanonicalizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CanonicalizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CanonicalizabilityRolloutCheck[]
  guidance: string
}

export type CanonicalizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCanonicalizabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateCanonicalizabilityRollout(
  input: CanonicalizabilityRolloutInput,
): CanonicalizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const canonicalizabilityTableCoverageComplete =
    input.existingCanonicalizabilityTableCount === CRITICAL_CANONICALIZABILITY_TABLES.length

  const checks: CanonicalizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL canonicalizability checks can reach the database.'
            : 'Production canonicalizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'canonicalizability_signal_table_coverage',
      label: 'Canonicalizability signal table coverage',
      status: canonicalizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Canonicalizability signal table coverage is only enforced in production.'
          : canonicalizabilityTableCoverageComplete
            ? `${input.existingCanonicalizabilityTableCount}/${CRITICAL_CANONICALIZABILITY_TABLES.length} canonicalizability signal tables are present.`
            : `${input.existingCanonicalizabilityTableCount}/${CRITICAL_CANONICALIZABILITY_TABLES.length} canonicalizability signal tables were found.`,
    },
    {
      name: 'model_health_canonicalizability',
      label: 'Model health canonicalizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health canonicalizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health canonicalizability signals.'
            : 'Production canonicalizability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_canonicalizability',
      label: 'Model registry canonicalizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry canonicalizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry canonicalizability signals.'
            : 'Production canonicalizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'canonicalization_readiness_signal',
      label: 'Canonicalization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          canonicalizabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Canonicalization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              canonicalizabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support canonicalization readiness.'
            : 'Production canonicalizability rollout requires PostgreSQL connectivity, canonicalizability tables, model health canonicalizability, model registry canonicalizability, and full signal coverage.',
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
        ? 'Production canonicalizability rollout checks passed. Canonicalizability coverage and canonicalization readiness signal signals are healthy.'
        : 'Production canonicalizability rollout is not ready. Resolve failed checks before relying on production canonicalizability tooling.',
  }
}

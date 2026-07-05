import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PATCHIZABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type PatchizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type PatchizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: PatchizabilityRolloutCheck[]
  guidance: string
}

export type PatchizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingPatchizabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluatePatchizabilityRollout(
  input: PatchizabilityRolloutInput,
): PatchizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const patchizabilityTableCoverageComplete =
    input.existingPatchizabilityTableCount === CRITICAL_PATCHIZABILITY_TABLES.length

  const checks: PatchizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL patchizability checks can reach the database.'
            : 'Production patchizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'patchizability_signal_table_coverage',
      label: 'Patchizability signal table coverage',
      status: patchizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Patchizability signal table coverage is only enforced in production.'
          : patchizabilityTableCoverageComplete
            ? `${input.existingPatchizabilityTableCount}/${CRITICAL_PATCHIZABILITY_TABLES.length} patchizability signal tables are present.`
            : `${input.existingPatchizabilityTableCount}/${CRITICAL_PATCHIZABILITY_TABLES.length} patchizability signal tables were found.`,
    },
    {
      name: 'model_health_patchizability',
      label: 'Model health patchizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health patchizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health patchizability signals.'
            : 'Production patchizability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_patchizability',
      label: 'Model registry patchizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry patchizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry patchizability signals.'
            : 'Production patchizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'patchization_readiness_signal',
      label: 'Patchization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          patchizabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Patchization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              patchizabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support optimization readiness.'
            : 'Production patchizability rollout requires PostgreSQL connectivity, patchizability tables, model health patchizability, model registry patchizability, and full signal coverage.',
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
        ? 'Production patchizability rollout checks passed. Patchizability coverage and patchization readiness signal signals are healthy.'
        : 'Production patchizability rollout is not ready. Resolve failed checks before relying on production patchizability tooling.',
  }
}

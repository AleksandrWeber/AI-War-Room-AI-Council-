import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SCANIZABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type ScanizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ScanizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ScanizabilityRolloutCheck[]
  guidance: string
}

export type ScanizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingScanizabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateScanizabilityRollout(
  input: ScanizabilityRolloutInput,
): ScanizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const scanizabilityTableCoverageComplete =
    input.existingScanizabilityTableCount === CRITICAL_SCANIZABILITY_TABLES.length

  const checks: ScanizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL scanizability checks can reach the database.'
            : 'Production scanizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'scanizability_signal_table_coverage',
      label: 'Scanizability signal table coverage',
      status: scanizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Scanizability signal table coverage is only enforced in production.'
          : scanizabilityTableCoverageComplete
            ? `${input.existingScanizabilityTableCount}/${CRITICAL_SCANIZABILITY_TABLES.length} scanizability signal tables are present.`
            : `${input.existingScanizabilityTableCount}/${CRITICAL_SCANIZABILITY_TABLES.length} scanizability signal tables were found.`,
    },
    {
      name: 'model_health_scanizability',
      label: 'Model health scanizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health scanizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health scanizability signals.'
            : 'Production scanizability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_scanizability',
      label: 'Model registry scanizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry scanizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry scanizability signals.'
            : 'Production scanizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'scanization_readiness_signal',
      label: 'Meshabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          scanizabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Meshabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              scanizabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support optimization readiness.'
            : 'Production scanizability rollout requires PostgreSQL connectivity, scanizability tables, model health scanizability, model registry scanizability, and full signal coverage.',
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
        ? 'Production scanizability rollout checks passed. Scanizability coverage and meshabilization readiness signal signals are healthy.'
        : 'Production scanizability rollout is not ready. Resolve failed checks before relying on production scanizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DEPLOYABILIZABILITY_TABLES = [
  'model_health_events',
  'model_registry_entries',
  'billing_records',
] as const

export type DeployabilizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DeployabilizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DeployabilizabilityRolloutCheck[]
  guidance: string
}

export type DeployabilizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDeployabilizabilityTableCount: number
  modelHealthEventsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateDeployabilizabilityRollout(
  input: DeployabilizabilityRolloutInput,
): DeployabilizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const deployabilizabilityTableCoverageComplete =
    input.existingDeployabilizabilityTableCount === CRITICAL_DEPLOYABILIZABILITY_TABLES.length

  const checks: DeployabilizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL deployabilizability checks can reach the database.'
            : 'Production deployabilizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'deployabilizability_signal_table_coverage',
      label: 'Deployabilizability signal table coverage',
      status: deployabilizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Deployabilizability signal table coverage is only enforced in production.'
          : deployabilizabilityTableCoverageComplete
            ? `${input.existingDeployabilizabilityTableCount}/${CRITICAL_DEPLOYABILIZABILITY_TABLES.length} deployabilizability signal tables are present.`
            : `${input.existingDeployabilizabilityTableCount}/${CRITICAL_DEPLOYABILIZABILITY_TABLES.length} deployabilizability signal tables were found.`,
    },
    {
      name: 'model_health_deployabilizability',
      label: 'Model health deployabilizability',
      status: input.modelHealthEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health deployabilizability is only enforced in production.'
          : input.modelHealthEventsTableExists
            ? 'model_health_events table is available for model health deployabilizability signals.'
            : 'Production deployabilizability rollout requires a model_health_events table.',
    },
    {
      name: 'model_registry_deployabilizability',
      label: 'Model registry deployabilizability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry deployabilizability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry deployabilizability signals.'
            : 'Production deployabilizability rollout requires a model_registry_entries table.',
    },
    {
      name: 'deployabilization_readiness_signal',
      label: 'Deployabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          deployabilizabilityTableCoverageComplete &&
          input.modelHealthEventsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Deployabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              deployabilizabilityTableCoverageComplete &&
              input.modelHealthEventsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingRecordsTableExists
            ? 'Model health events, model registry entries, and billing records support optimization readiness.'
            : 'Production deployabilizability rollout requires PostgreSQL connectivity, deployabilizability tables, model health deployabilizability, model registry deployabilizability, and full signal coverage.',
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
        ? 'Production deployabilizability rollout checks passed. Deployabilizability coverage and deployabilization readiness signal signals are healthy.'
        : 'Production deployabilizability rollout is not ready. Resolve failed checks before relying on production deployabilizability tooling.',
  }
}

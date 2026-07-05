import type { ApiEnv } from '../config/env.js'

export const CRITICAL_WARRANTABILITY_TABLES = [
  'shield_scans',
  'artifacts',
  'run_workflows',
] as const

export type WarrantabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type WarrantabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: WarrantabilityRolloutCheck[]
  guidance: string
}

export type WarrantabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingWarrantabilityTableCount: number
  shieldScansTableExists: boolean
  artifactsTableExists: boolean
  runWorkflowsTableExists: boolean
}

export function evaluateWarrantabilityRollout(
  input: WarrantabilityRolloutInput,
): WarrantabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const warrantabilityTableCoverageComplete =
    input.existingWarrantabilityTableCount === CRITICAL_WARRANTABILITY_TABLES.length

  const checks: WarrantabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL warrantability checks can reach the database.'
            : 'Production warrantability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'warrantability_signal_table_coverage',
      label: 'Warrantability signal table coverage',
      status: warrantabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Warrantability signal table coverage is only enforced in production.'
          : warrantabilityTableCoverageComplete
            ? `${input.existingWarrantabilityTableCount}/${CRITICAL_WARRANTABILITY_TABLES.length} warrantability signal tables are present.`
            : `${input.existingWarrantabilityTableCount}/${CRITICAL_WARRANTABILITY_TABLES.length} warrantability signal tables were found.`,
    },
    {
      name: 'shield_scan_warrantability',
      label: 'Shield scan warrantability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan warrantability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan warrantability signals.'
            : 'Production warrantability rollout requires a shield_scans table.',
    },
    {
      name: 'artifact_warrantability',
      label: 'Artifact warrantability',
      status: input.artifactsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Artifact warrantability is only enforced in production.'
          : input.artifactsTableExists
            ? 'artifacts table is available for artifact warrantability signals.'
            : 'Production warrantability rollout requires a artifacts table.',
    },
    {
      name: 'warrant_readiness_signal',
      label: 'Warrant readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          warrantabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.artifactsTableExists &&
          input.runWorkflowsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Warrant readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              warrantabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.artifactsTableExists &&
              input.runWorkflowsTableExists
            ? 'Shield scans, persisted artifacts, and run workflows support warrant readiness.'
            : 'Production warrantability rollout requires PostgreSQL connectivity, warrantability tables, shield scan warrantability, artifact warrantability, and full signal coverage.',
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
        ? 'Production warrantability rollout checks passed. Warrantability coverage and warrant readiness signal signals are healthy.'
        : 'Production warrantability rollout is not ready. Resolve failed checks before relying on production warrantability tooling.',
  }
}

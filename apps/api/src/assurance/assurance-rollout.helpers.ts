import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ASSURANCE_TABLES = [
  'shield_scans',
  'artifacts',
  'agent_outputs',
] as const

export type AssuranceRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AssuranceRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AssuranceRolloutCheck[]
  guidance: string
}

export type AssuranceRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAssuranceTableCount: number
  shieldScansTableExists: boolean
  artifactsTableExists: boolean
  agentOutputsTableExists: boolean
}

export function evaluateAssuranceRollout(
  input: AssuranceRolloutInput,
): AssuranceRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const assuranceTableCoverageComplete =
    input.existingAssuranceTableCount === CRITICAL_ASSURANCE_TABLES.length

  const checks: AssuranceRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL assurance checks can reach the database.'
            : 'Production assurance rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'assurance_signal_table_coverage',
      label: 'Assurance signal table coverage',
      status: assuranceTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Assurance signal table coverage is only enforced in production.'
          : assuranceTableCoverageComplete
            ? `${input.existingAssuranceTableCount}/${CRITICAL_ASSURANCE_TABLES.length} assurance signal tables are present.`
            : `${input.existingAssuranceTableCount}/${CRITICAL_ASSURANCE_TABLES.length} assurance signal tables were found.`,
    },
    {
      name: 'shield_quality_assurance',
      label: 'Shield quality assurance',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield quality assurance is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield quality assurance signals.'
            : 'Production assurance rollout requires a shield_scans table.',
    },
    {
      name: 'artifact_quality_assurance',
      label: 'Artifact quality assurance',
      status: input.artifactsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Artifact quality assurance is only enforced in production.'
          : input.artifactsTableExists
            ? 'artifacts table is available for artifact quality assurance signals.'
            : 'Production assurance rollout requires an artifacts table.',
    },
    {
      name: 'quality_readiness_signal',
      label: 'Quality readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          assuranceTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.artifactsTableExists &&
          input.agentOutputsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Quality readiness is only enforced in production.'
          : input.postgresConnectivity &&
              assuranceTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.artifactsTableExists &&
              input.agentOutputsTableExists
            ? 'Shield reviews, persisted artifacts, and agent outputs support quality readiness.'
            : 'Production assurance rollout requires PostgreSQL connectivity, assurance tables, shield quality assurance, artifact coverage, and agent output signals.',
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
        ? 'Production assurance rollout checks passed. Assurance coverage and quality readiness signals are healthy.'
        : 'Production assurance rollout is not ready. Resolve failed checks before relying on production assurance tooling.',
  }
}

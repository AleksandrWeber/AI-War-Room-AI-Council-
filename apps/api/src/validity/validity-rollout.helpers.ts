import type { ApiEnv } from '../config/env.js'

export const CRITICAL_VALIDITY_TABLES = [
  'agent_outputs',
  'artifacts',
  'shield_scans',
] as const

export type ValidityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ValidityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ValidityRolloutCheck[]
  guidance: string
}

export type ValidityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingValidityTableCount: number
  agentOutputsTableExists: boolean
  artifactsTableExists: boolean
  shieldScansTableExists: boolean
}

export function evaluateValidityRollout(
  input: ValidityRolloutInput,
): ValidityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const validityTableCoverageComplete =
    input.existingValidityTableCount === CRITICAL_VALIDITY_TABLES.length

  const checks: ValidityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL validity checks can reach the database.'
            : 'Production validity rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'validity_signal_table_coverage',
      label: 'Validity signal table coverage',
      status: validityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Validity signal table coverage is only enforced in production.'
          : validityTableCoverageComplete
            ? `${input.existingValidityTableCount}/${CRITICAL_VALIDITY_TABLES.length} validity signal tables are present.`
            : `${input.existingValidityTableCount}/${CRITICAL_VALIDITY_TABLES.length} validity signal tables were found.`,
    },
    {
      name: 'agent_output_validity',
      label: 'Agent output validity',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output validity is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output validity signals.'
            : 'Production validity rollout requires a agent_outputs table.',
    },
    {
      name: 'artifact_content_validity',
      label: 'Artifact content validity',
      status: input.artifactsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Artifact content validity is only enforced in production.'
          : input.artifactsTableExists
            ? 'artifacts table is available for artifact content validity signals.'
            : 'Production validity rollout requires a artifacts table.',
    },
    {
      name: 'validation_readiness_signal',
      label: 'Validation readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          validityTableCoverageComplete &&
          input.agentOutputsTableExists &&
          input.artifactsTableExists &&
          input.shieldScansTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Validation readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              validityTableCoverageComplete &&
              input.agentOutputsTableExists &&
              input.artifactsTableExists &&
              input.shieldScansTableExists
            ? 'Agent outputs, persisted artifacts, and shield scans support validation readiness.'
            : 'Production validity rollout requires PostgreSQL connectivity, validity tables, agent output validity, artifact content validity, and full signal coverage.',
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
        ? 'Production validity rollout checks passed. Validity coverage and validation readiness signal signals are healthy.'
        : 'Production validity rollout is not ready. Resolve failed checks before relying on production validity tooling.',
  }
}

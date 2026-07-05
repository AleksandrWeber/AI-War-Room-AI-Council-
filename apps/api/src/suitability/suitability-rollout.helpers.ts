import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SUITABILITY_TABLES = [
  'agent_outputs',
  'artifacts',
  'moderator_syntheses',
] as const

export type SuitabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SuitabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SuitabilityRolloutCheck[]
  guidance: string
}

export type SuitabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSuitabilityTableCount: number
  agentOutputsTableExists: boolean
  artifactsTableExists: boolean
  moderatorSynthesesTableExists: boolean
}

export function evaluateSuitabilityRollout(
  input: SuitabilityRolloutInput,
): SuitabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const suitabilityTableCoverageComplete =
    input.existingSuitabilityTableCount === CRITICAL_SUITABILITY_TABLES.length

  const checks: SuitabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL suitability checks can reach the database.'
            : 'Production suitability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'suitability_signal_table_coverage',
      label: 'Suitability signal table coverage',
      status: suitabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Suitability signal table coverage is only enforced in production.'
          : suitabilityTableCoverageComplete
            ? `${input.existingSuitabilityTableCount}/${CRITICAL_SUITABILITY_TABLES.length} suitability signal tables are present.`
            : `${input.existingSuitabilityTableCount}/${CRITICAL_SUITABILITY_TABLES.length} suitability signal tables were found.`,
    },
    {
      name: 'agent_output_suitability',
      label: 'Agent output suitability',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output suitability is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output suitability signals.'
            : 'Production suitability rollout requires a agent_outputs table.',
    },
    {
      name: 'artifact_suitability',
      label: 'Artifact suitability',
      status: input.artifactsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Artifact suitability is only enforced in production.'
          : input.artifactsTableExists
            ? 'artifacts table is available for artifact suitability signals.'
            : 'Production suitability rollout requires a artifacts table.',
    },
    {
      name: 'suitability_readiness_signal',
      label: 'Suitability readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          suitabilityTableCoverageComplete &&
          input.agentOutputsTableExists &&
          input.artifactsTableExists &&
          input.moderatorSynthesesTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Suitability readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              suitabilityTableCoverageComplete &&
              input.agentOutputsTableExists &&
              input.artifactsTableExists &&
              input.moderatorSynthesesTableExists
            ? 'Agent outputs, persisted artifacts, and moderator syntheses support suitability readiness.'
            : 'Production suitability rollout requires PostgreSQL connectivity, suitability tables, agent output suitability, artifact suitability, and full signal coverage.',
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
        ? 'Production suitability rollout checks passed. Suitability coverage and suitability readiness signal signals are healthy.'
        : 'Production suitability rollout is not ready. Resolve failed checks before relying on production suitability tooling.',
  }
}

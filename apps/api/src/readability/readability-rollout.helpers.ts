import type { ApiEnv } from '../config/env.js'

export const CRITICAL_READABILITY_TABLES = [
  'artifacts',
  'agent_outputs',
  'moderator_syntheses',
] as const

export type ReadabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ReadabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ReadabilityRolloutCheck[]
  guidance: string
}

export type ReadabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingReadabilityTableCount: number
  artifactsTableExists: boolean
  agentOutputsTableExists: boolean
  moderatorSynthesesTableExists: boolean
}

export function evaluateReadabilityRollout(
  input: ReadabilityRolloutInput,
): ReadabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const readabilityTableCoverageComplete =
    input.existingReadabilityTableCount === CRITICAL_READABILITY_TABLES.length

  const checks: ReadabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL readability checks can reach the database.'
            : 'Production readability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'readability_signal_table_coverage',
      label: 'Readability signal table coverage',
      status: readabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Readability signal table coverage is only enforced in production.'
          : readabilityTableCoverageComplete
            ? `${input.existingReadabilityTableCount}/${CRITICAL_READABILITY_TABLES.length} readability signal tables are present.`
            : `${input.existingReadabilityTableCount}/${CRITICAL_READABILITY_TABLES.length} readability signal tables were found.`,
    },
    {
      name: 'artifact_readability',
      label: 'Artifact readability',
      status: input.artifactsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Artifact readability is only enforced in production.'
          : input.artifactsTableExists
            ? 'artifacts table is available for artifact readability signals.'
            : 'Production readability rollout requires a artifacts table.',
    },
    {
      name: 'agent_output_readability',
      label: 'Agent output readability',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output readability is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output readability signals.'
            : 'Production readability rollout requires a agent_outputs table.',
    },
    {
      name: 'readability_readiness_signal',
      label: 'Readability readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          readabilityTableCoverageComplete &&
          input.artifactsTableExists &&
          input.agentOutputsTableExists &&
          input.moderatorSynthesesTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Readability readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              readabilityTableCoverageComplete &&
              input.artifactsTableExists &&
              input.agentOutputsTableExists &&
              input.moderatorSynthesesTableExists
            ? 'Artifacts, agent outputs, and moderator syntheses support readability readiness.'
            : 'Production readability rollout requires PostgreSQL connectivity, readability tables, artifact readability, agent output readability, and full signal coverage.',
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
        ? 'Production readability rollout checks passed. Readability coverage and readability readiness signal signals are healthy.'
        : 'Production readability rollout is not ready. Resolve failed checks before relying on production readability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_LEARNABILITY_TABLES = [
  'agent_outputs',
  'artifacts',
  'moderator_syntheses',
] as const

export type LearnabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type LearnabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: LearnabilityRolloutCheck[]
  guidance: string
}

export type LearnabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingLearnabilityTableCount: number
  agentOutputsTableExists: boolean
  artifactsTableExists: boolean
  moderatorSynthesesTableExists: boolean
}

export function evaluateLearnabilityRollout(
  input: LearnabilityRolloutInput,
): LearnabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const learnabilityTableCoverageComplete =
    input.existingLearnabilityTableCount === CRITICAL_LEARNABILITY_TABLES.length

  const checks: LearnabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL learnability checks can reach the database.'
            : 'Production learnability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'learnability_signal_table_coverage',
      label: 'Learnability signal table coverage',
      status: learnabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Learnability signal table coverage is only enforced in production.'
          : learnabilityTableCoverageComplete
            ? `${input.existingLearnabilityTableCount}/${CRITICAL_LEARNABILITY_TABLES.length} learnability signal tables are present.`
            : `${input.existingLearnabilityTableCount}/${CRITICAL_LEARNABILITY_TABLES.length} learnability signal tables were found.`,
    },
    {
      name: 'agent_output_learnability',
      label: 'Agent output learnability',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output learnability is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output learnability signals.'
            : 'Production learnability rollout requires a agent_outputs table.',
    },
    {
      name: 'artifact_learnability',
      label: 'Artifact learnability',
      status: input.artifactsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Artifact learnability is only enforced in production.'
          : input.artifactsTableExists
            ? 'artifacts table is available for artifact learnability signals.'
            : 'Production learnability rollout requires a artifacts table.',
    },
    {
      name: 'learning_readiness_signal',
      label: 'Learning readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          learnabilityTableCoverageComplete &&
          input.agentOutputsTableExists &&
          input.artifactsTableExists &&
          input.moderatorSynthesesTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Learning readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              learnabilityTableCoverageComplete &&
              input.agentOutputsTableExists &&
              input.artifactsTableExists &&
              input.moderatorSynthesesTableExists
            ? 'Agent outputs, persisted artifacts, and moderator syntheses support learning readiness.'
            : 'Production learnability rollout requires PostgreSQL connectivity, learnability tables, agent output learnability, artifact learnability, and full signal coverage.',
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
        ? 'Production learnability rollout checks passed. Learnability coverage and learning readiness signal signals are healthy.'
        : 'Production learnability rollout is not ready. Resolve failed checks before relying on production learnability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_EFFECTIVENESS_TABLES = [
  'agent_outputs',
  'moderator_syntheses',
  'artifacts',
] as const

export type EffectivenessRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type EffectivenessRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: EffectivenessRolloutCheck[]
  guidance: string
}

export type EffectivenessRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingEffectivenessTableCount: number
  agentOutputsTableExists: boolean
  moderatorSynthesesTableExists: boolean
  artifactsTableExists: boolean
}

export function evaluateEffectivenessRollout(
  input: EffectivenessRolloutInput,
): EffectivenessRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const effectivenessTableCoverageComplete =
    input.existingEffectivenessTableCount === CRITICAL_EFFECTIVENESS_TABLES.length

  const checks: EffectivenessRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL effectiveness checks can reach the database.'
            : 'Production effectiveness rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'effectiveness_signal_table_coverage',
      label: 'Effectiveness signal table coverage',
      status: effectivenessTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Effectiveness signal table coverage is only enforced in production.'
          : effectivenessTableCoverageComplete
            ? `${input.existingEffectivenessTableCount}/${CRITICAL_EFFECTIVENESS_TABLES.length} effectiveness signal tables are present.`
            : `${input.existingEffectivenessTableCount}/${CRITICAL_EFFECTIVENESS_TABLES.length} effectiveness signal tables were found.`,
    },
    {
      name: 'agent_output_effectiveness',
      label: 'Agent output effectiveness',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output effectiveness is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output effectiveness signals.'
            : 'Production effectiveness rollout requires a agent_outputs table.',
    },
    {
      name: 'synthesis_effectiveness',
      label: 'Synthesis effectiveness',
      status: input.moderatorSynthesesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Synthesis effectiveness is only enforced in production.'
          : input.moderatorSynthesesTableExists
            ? 'moderator_syntheses table is available for synthesis effectiveness signals.'
            : 'Production effectiveness rollout requires a moderator_syntheses table.',
    },
    {
      name: 'effect_readiness_signal',
      label: 'Effect readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          effectivenessTableCoverageComplete &&
          input.agentOutputsTableExists &&
          input.moderatorSynthesesTableExists &&
          input.artifactsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Effect readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              effectivenessTableCoverageComplete &&
              input.agentOutputsTableExists &&
              input.moderatorSynthesesTableExists &&
              input.artifactsTableExists
            ? 'Agent outputs, moderator syntheses, and persisted artifacts support effect readiness.'
            : 'Production effectiveness rollout requires PostgreSQL connectivity, effectiveness tables, agent output effectiveness, synthesis effectiveness, and full signal coverage.',
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
        ? 'Production effectiveness rollout checks passed. Effectiveness coverage and effect readiness signal signals are healthy.'
        : 'Production effectiveness rollout is not ready. Resolve failed checks before relying on production effectiveness tooling.',
  }
}

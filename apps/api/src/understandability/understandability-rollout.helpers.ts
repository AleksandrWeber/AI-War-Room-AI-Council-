import type { ApiEnv } from '../config/env.js'

export const CRITICAL_UNDERSTANDABILITY_TABLES = [
  'moderator_syntheses',
  'agent_outputs',
  'artifacts',
] as const

export type UnderstandabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type UnderstandabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: UnderstandabilityRolloutCheck[]
  guidance: string
}

export type UnderstandabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingUnderstandabilityTableCount: number
  moderatorSynthesesTableExists: boolean
  agentOutputsTableExists: boolean
  artifactsTableExists: boolean
}

export function evaluateUnderstandabilityRollout(
  input: UnderstandabilityRolloutInput,
): UnderstandabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const understandabilityTableCoverageComplete =
    input.existingUnderstandabilityTableCount === CRITICAL_UNDERSTANDABILITY_TABLES.length

  const checks: UnderstandabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL understandability checks can reach the database.'
            : 'Production understandability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'understandability_signal_table_coverage',
      label: 'Understandability signal table coverage',
      status: understandabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Understandability signal table coverage is only enforced in production.'
          : understandabilityTableCoverageComplete
            ? `${input.existingUnderstandabilityTableCount}/${CRITICAL_UNDERSTANDABILITY_TABLES.length} understandability signal tables are present.`
            : `${input.existingUnderstandabilityTableCount}/${CRITICAL_UNDERSTANDABILITY_TABLES.length} understandability signal tables were found.`,
    },
    {
      name: 'synthesis_understandability',
      label: 'Synthesis understandability',
      status: input.moderatorSynthesesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Synthesis understandability is only enforced in production.'
          : input.moderatorSynthesesTableExists
            ? 'moderator_syntheses table is available for synthesis understandability signals.'
            : 'Production understandability rollout requires a moderator_syntheses table.',
    },
    {
      name: 'agent_output_understandability',
      label: 'Agent output understandability',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output understandability is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output understandability signals.'
            : 'Production understandability rollout requires a agent_outputs table.',
    },
    {
      name: 'understanding_readiness_signal',
      label: 'Understanding readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          understandabilityTableCoverageComplete &&
          input.moderatorSynthesesTableExists &&
          input.agentOutputsTableExists &&
          input.artifactsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Understanding readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              understandabilityTableCoverageComplete &&
              input.moderatorSynthesesTableExists &&
              input.agentOutputsTableExists &&
              input.artifactsTableExists
            ? 'Moderator syntheses, agent outputs, and persisted artifacts support understanding readiness.'
            : 'Production understandability rollout requires PostgreSQL connectivity, understandability tables, synthesis understandability, agent output understandability, and full signal coverage.',
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
        ? 'Production understandability rollout checks passed. Understandability coverage and understanding readiness signal signals are healthy.'
        : 'Production understandability rollout is not ready. Resolve failed checks before relying on production understandability tooling.',
  }
}

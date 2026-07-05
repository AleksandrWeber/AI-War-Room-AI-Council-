import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DISCERNIBILITY_TABLES = [
  'moderator_syntheses',
  'agent_outputs',
  'artifacts',
] as const

export type DiscernibilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DiscernibilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DiscernibilityRolloutCheck[]
  guidance: string
}

export type DiscernibilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDiscernibilityTableCount: number
  moderatorSynthesesTableExists: boolean
  agentOutputsTableExists: boolean
  artifactsTableExists: boolean
}

export function evaluateDiscernibilityRollout(
  input: DiscernibilityRolloutInput,
): DiscernibilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const discernibilityTableCoverageComplete =
    input.existingDiscernibilityTableCount === CRITICAL_DISCERNIBILITY_TABLES.length

  const checks: DiscernibilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL discernibility checks can reach the database.'
            : 'Production discernibility rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'discernibility_signal_table_coverage',
      label: 'Discernibility signal table coverage',
      status: discernibilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Discernibility signal table coverage is only enforced in production.'
          : discernibilityTableCoverageComplete
            ? `${input.existingDiscernibilityTableCount}/${CRITICAL_DISCERNIBILITY_TABLES.length} discernibility signal tables are present.`
            : `${input.existingDiscernibilityTableCount}/${CRITICAL_DISCERNIBILITY_TABLES.length} discernibility signal tables were found.`,
    },
    {
      name: 'synthesis_discernibility',
      label: 'Synthesis discernibility',
      status: input.moderatorSynthesesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Synthesis discernibility is only enforced in production.'
          : input.moderatorSynthesesTableExists
            ? 'moderator_syntheses table is available for synthesis discernibility signals.'
            : 'Production discernibility rollout requires a moderator_syntheses table.',
    },
    {
      name: 'agent_output_discernibility',
      label: 'Agent output discernibility',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output discernibility is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output discernibility signals.'
            : 'Production discernibility rollout requires a agent_outputs table.',
    },
    {
      name: 'discernment_readiness_signal',
      label: 'Discernment readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          discernibilityTableCoverageComplete &&
          input.moderatorSynthesesTableExists &&
          input.agentOutputsTableExists &&
          input.artifactsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Discernment readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              discernibilityTableCoverageComplete &&
              input.moderatorSynthesesTableExists &&
              input.agentOutputsTableExists &&
              input.artifactsTableExists
            ? 'Moderator syntheses, agent outputs, and persisted artifacts support discernment readiness.'
            : 'Production discernibility rollout requires PostgreSQL connectivity, discernibility tables, synthesis discernibility, agent output discernibility, and full signal coverage.',
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
        ? 'Production discernibility rollout checks passed. Discernibility coverage and discernment readiness signal signals are healthy.'
        : 'Production discernibility rollout is not ready. Resolve failed checks before relying on production discernibility tooling.',
  }
}

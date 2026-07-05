import type { ApiEnv } from '../config/env.js'

export const CRITICAL_COMMUNICABILITY_TABLES = [
  'moderator_syntheses',
  'agent_outputs',
  'artifacts',
] as const

export type CommunicabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CommunicabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CommunicabilityRolloutCheck[]
  guidance: string
}

export type CommunicabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCommunicabilityTableCount: number
  moderatorSynthesesTableExists: boolean
  agentOutputsTableExists: boolean
  artifactsTableExists: boolean
}

export function evaluateCommunicabilityRollout(
  input: CommunicabilityRolloutInput,
): CommunicabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const communicabilityTableCoverageComplete =
    input.existingCommunicabilityTableCount === CRITICAL_COMMUNICABILITY_TABLES.length

  const checks: CommunicabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL communicability checks can reach the database.'
            : 'Production communicability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'communicability_signal_table_coverage',
      label: 'Communicability signal table coverage',
      status: communicabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Communicability signal table coverage is only enforced in production.'
          : communicabilityTableCoverageComplete
            ? `${input.existingCommunicabilityTableCount}/${CRITICAL_COMMUNICABILITY_TABLES.length} communicability signal tables are present.`
            : `${input.existingCommunicabilityTableCount}/${CRITICAL_COMMUNICABILITY_TABLES.length} communicability signal tables were found.`,
    },
    {
      name: 'synthesis_communicability',
      label: 'Synthesis communicability',
      status: input.moderatorSynthesesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Synthesis communicability is only enforced in production.'
          : input.moderatorSynthesesTableExists
            ? 'moderator_syntheses table is available for synthesis communicability signals.'
            : 'Production communicability rollout requires a moderator_syntheses table.',
    },
    {
      name: 'agent_output_communicability',
      label: 'Agent output communicability',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output communicability is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output communicability signals.'
            : 'Production communicability rollout requires a agent_outputs table.',
    },
    {
      name: 'communication_readiness_signal',
      label: 'Communication readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          communicabilityTableCoverageComplete &&
          input.moderatorSynthesesTableExists &&
          input.agentOutputsTableExists &&
          input.artifactsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Communication readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              communicabilityTableCoverageComplete &&
              input.moderatorSynthesesTableExists &&
              input.agentOutputsTableExists &&
              input.artifactsTableExists
            ? 'Moderator syntheses, agent outputs, and persisted artifacts support communication readiness.'
            : 'Production communicability rollout requires PostgreSQL connectivity, communicability tables, synthesis communicability, agent output communicability, and full signal coverage.',
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
        ? 'Production communicability rollout checks passed. Communicability coverage and communication readiness signal signals are healthy.'
        : 'Production communicability rollout is not ready. Resolve failed checks before relying on production communicability tooling.',
  }
}

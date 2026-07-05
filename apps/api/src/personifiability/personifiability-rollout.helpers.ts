import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PERSONIFIABILITY_TABLES = [
  'agent_outputs',
  'moderator_syntheses',
  'artifacts',
] as const

export type PersonifiabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type PersonifiabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: PersonifiabilityRolloutCheck[]
  guidance: string
}

export type PersonifiabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingPersonifiabilityTableCount: number
  agentOutputsTableExists: boolean
  moderatorSynthesesTableExists: boolean
  artifactsTableExists: boolean
}

export function evaluatePersonifiabilityRollout(
  input: PersonifiabilityRolloutInput,
): PersonifiabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const personifiabilityTableCoverageComplete =
    input.existingPersonifiabilityTableCount === CRITICAL_PERSONIFIABILITY_TABLES.length

  const checks: PersonifiabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL personifiability checks can reach the database.'
            : 'Production personifiability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'personifiability_signal_table_coverage',
      label: 'Personifiability signal table coverage',
      status: personifiabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Personifiability signal table coverage is only enforced in production.'
          : personifiabilityTableCoverageComplete
            ? `${input.existingPersonifiabilityTableCount}/${CRITICAL_PERSONIFIABILITY_TABLES.length} personifiability signal tables are present.`
            : `${input.existingPersonifiabilityTableCount}/${CRITICAL_PERSONIFIABILITY_TABLES.length} personifiability signal tables were found.`,
    },
    {
      name: 'agent_output_personifiability',
      label: 'Agent output personifiability',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output personifiability is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output personifiability signals.'
            : 'Production personifiability rollout requires a agent_outputs table.',
    },
    {
      name: 'synthesis_personifiability',
      label: 'Synthesis personifiability',
      status: input.moderatorSynthesesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Synthesis personifiability is only enforced in production.'
          : input.moderatorSynthesesTableExists
            ? 'moderator_syntheses table is available for synthesis personifiability signals.'
            : 'Production personifiability rollout requires a moderator_syntheses table.',
    },
    {
      name: 'personification_readiness_signal',
      label: 'Personification readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          personifiabilityTableCoverageComplete &&
          input.agentOutputsTableExists &&
          input.moderatorSynthesesTableExists &&
          input.artifactsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Personification readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              personifiabilityTableCoverageComplete &&
              input.agentOutputsTableExists &&
              input.moderatorSynthesesTableExists &&
              input.artifactsTableExists
            ? 'Agent outputs, moderator syntheses, and persisted artifacts support personification readiness.'
            : 'Production personifiability rollout requires PostgreSQL connectivity, personifiability tables, agent output personifiability, synthesis personifiability, and full signal coverage.',
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
        ? 'Production personifiability rollout checks passed. Personifiability coverage and personification readiness signal signals are healthy.'
        : 'Production personifiability rollout is not ready. Resolve failed checks before relying on production personifiability tooling.',
  }
}

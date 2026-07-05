import type { ApiEnv } from '../config/env.js'

export const CRITICAL_INTELLIGIBILITY_TABLES = [
  'moderator_syntheses',
  'agent_outputs',
  'artifacts',
] as const

export type IntelligibilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type IntelligibilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: IntelligibilityRolloutCheck[]
  guidance: string
}

export type IntelligibilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingIntelligibilityTableCount: number
  moderatorSynthesesTableExists: boolean
  agentOutputsTableExists: boolean
  artifactsTableExists: boolean
}

export function evaluateIntelligibilityRollout(
  input: IntelligibilityRolloutInput,
): IntelligibilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const intelligibilityTableCoverageComplete =
    input.existingIntelligibilityTableCount === CRITICAL_INTELLIGIBILITY_TABLES.length

  const checks: IntelligibilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL intelligibility checks can reach the database.'
            : 'Production intelligibility rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'intelligibility_signal_table_coverage',
      label: 'Intelligibility signal table coverage',
      status: intelligibilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Intelligibility signal table coverage is only enforced in production.'
          : intelligibilityTableCoverageComplete
            ? `${input.existingIntelligibilityTableCount}/${CRITICAL_INTELLIGIBILITY_TABLES.length} intelligibility signal tables are present.`
            : `${input.existingIntelligibilityTableCount}/${CRITICAL_INTELLIGIBILITY_TABLES.length} intelligibility signal tables were found.`,
    },
    {
      name: 'synthesis_intelligibility',
      label: 'Synthesis intelligibility',
      status: input.moderatorSynthesesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Synthesis intelligibility is only enforced in production.'
          : input.moderatorSynthesesTableExists
            ? 'moderator_syntheses table is available for synthesis intelligibility signals.'
            : 'Production intelligibility rollout requires a moderator_syntheses table.',
    },
    {
      name: 'agent_output_intelligibility',
      label: 'Agent output intelligibility',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output intelligibility is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output intelligibility signals.'
            : 'Production intelligibility rollout requires a agent_outputs table.',
    },
    {
      name: 'intelligibility_readiness_signal',
      label: 'Intelligibility readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          intelligibilityTableCoverageComplete &&
          input.moderatorSynthesesTableExists &&
          input.agentOutputsTableExists &&
          input.artifactsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Intelligibility readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              intelligibilityTableCoverageComplete &&
              input.moderatorSynthesesTableExists &&
              input.agentOutputsTableExists &&
              input.artifactsTableExists
            ? 'Moderator syntheses, agent outputs, and persisted artifacts support intelligibility readiness.'
            : 'Production intelligibility rollout requires PostgreSQL connectivity, intelligibility tables, synthesis intelligibility, agent output intelligibility, and full signal coverage.',
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
        ? 'Production intelligibility rollout checks passed. Intelligibility coverage and intelligibility readiness signal signals are healthy.'
        : 'Production intelligibility rollout is not ready. Resolve failed checks before relying on production intelligibility tooling.',
  }
}

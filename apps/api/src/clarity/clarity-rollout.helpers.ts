import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CLARITY_TABLES = [
  'moderator_syntheses',
  'agent_outputs',
  'artifacts',
] as const

export type ClarityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ClarityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ClarityRolloutCheck[]
  guidance: string
}

export type ClarityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingClarityTableCount: number
  moderatorSynthesesTableExists: boolean
  agentOutputsTableExists: boolean
  artifactsTableExists: boolean
}

export function evaluateClarityRollout(
  input: ClarityRolloutInput,
): ClarityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const clarityTableCoverageComplete =
    input.existingClarityTableCount === CRITICAL_CLARITY_TABLES.length

  const checks: ClarityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL clarity checks can reach the database.'
            : 'Production clarity rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'clarity_signal_table_coverage',
      label: 'Clarity signal table coverage',
      status: clarityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Clarity signal table coverage is only enforced in production.'
          : clarityTableCoverageComplete
            ? `${input.existingClarityTableCount}/${CRITICAL_CLARITY_TABLES.length} clarity signal tables are present.`
            : `${input.existingClarityTableCount}/${CRITICAL_CLARITY_TABLES.length} clarity signal tables were found.`,
    },
    {
      name: 'synthesis_clarity',
      label: 'Synthesis clarity',
      status: input.moderatorSynthesesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Synthesis clarity is only enforced in production.'
          : input.moderatorSynthesesTableExists
            ? 'moderator_syntheses table is available for synthesis clarity signals.'
            : 'Production clarity rollout requires a moderator_syntheses table.',
    },
    {
      name: 'agent_output_clarity',
      label: 'Agent output clarity',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output clarity is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output clarity signals.'
            : 'Production clarity rollout requires a agent_outputs table.',
    },
    {
      name: 'clarity_readiness_signal',
      label: 'Clarity readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          clarityTableCoverageComplete &&
          input.moderatorSynthesesTableExists &&
          input.agentOutputsTableExists &&
          input.artifactsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Clarity readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              clarityTableCoverageComplete &&
              input.moderatorSynthesesTableExists &&
              input.agentOutputsTableExists &&
              input.artifactsTableExists
            ? 'Moderator syntheses, agent outputs, and persisted artifacts support clarity readiness.'
            : 'Production clarity rollout requires PostgreSQL connectivity, clarity tables, synthesis clarity, agent output clarity, and full signal coverage.',
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
        ? 'Production clarity rollout checks passed. Clarity coverage and clarity readiness signal signals are healthy.'
        : 'Production clarity rollout is not ready. Resolve failed checks before relying on production clarity tooling.',
  }
}

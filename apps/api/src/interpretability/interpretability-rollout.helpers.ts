import type { ApiEnv } from '../config/env.js'

export const CRITICAL_INTERPRETABILITY_TABLES = [
  'agent_outputs',
  'moderator_syntheses',
  'artifacts',
] as const

export type InterpretabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type InterpretabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: InterpretabilityRolloutCheck[]
  guidance: string
}

export type InterpretabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingInterpretabilityTableCount: number
  agentOutputsTableExists: boolean
  moderatorSynthesesTableExists: boolean
  artifactsTableExists: boolean
}

export function evaluateInterpretabilityRollout(
  input: InterpretabilityRolloutInput,
): InterpretabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const interpretabilityTableCoverageComplete =
    input.existingInterpretabilityTableCount === CRITICAL_INTERPRETABILITY_TABLES.length

  const checks: InterpretabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL interpretability checks can reach the database.'
            : 'Production interpretability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'interpretability_signal_table_coverage',
      label: 'Interpretability signal table coverage',
      status: interpretabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Interpretability signal table coverage is only enforced in production.'
          : interpretabilityTableCoverageComplete
            ? `${input.existingInterpretabilityTableCount}/${CRITICAL_INTERPRETABILITY_TABLES.length} interpretability signal tables are present.`
            : `${input.existingInterpretabilityTableCount}/${CRITICAL_INTERPRETABILITY_TABLES.length} interpretability signal tables were found.`,
    },
    {
      name: 'agent_output_interpretability',
      label: 'Agent output interpretability',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output interpretability is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output interpretability signals.'
            : 'Production interpretability rollout requires a agent_outputs table.',
    },
    {
      name: 'synthesis_interpretability',
      label: 'Synthesis interpretability',
      status: input.moderatorSynthesesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Synthesis interpretability is only enforced in production.'
          : input.moderatorSynthesesTableExists
            ? 'moderator_syntheses table is available for synthesis interpretability signals.'
            : 'Production interpretability rollout requires a moderator_syntheses table.',
    },
    {
      name: 'interpretability_readiness_signal',
      label: 'Interpretability readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          interpretabilityTableCoverageComplete &&
          input.agentOutputsTableExists &&
          input.moderatorSynthesesTableExists &&
          input.artifactsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Interpretability readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              interpretabilityTableCoverageComplete &&
              input.agentOutputsTableExists &&
              input.moderatorSynthesesTableExists &&
              input.artifactsTableExists
            ? 'Agent outputs, moderator syntheses, and persisted artifacts support interpretability readiness.'
            : 'Production interpretability rollout requires PostgreSQL connectivity, interpretability tables, agent output interpretability, synthesis interpretability, and full signal coverage.',
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
        ? 'Production interpretability rollout checks passed. Interpretability coverage and interpretability readiness signal signals are healthy.'
        : 'Production interpretability rollout is not ready. Resolve failed checks before relying on production interpretability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_EXPLAINABILITY_TABLES = [
  'moderator_syntheses',
  'agent_outputs',
  'artifacts',
] as const

export type ExplainabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ExplainabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ExplainabilityRolloutCheck[]
  guidance: string
}

export type ExplainabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingExplainabilityTableCount: number
  moderatorSynthesesTableExists: boolean
  agentOutputsTableExists: boolean
  artifactsTableExists: boolean
}

export function evaluateExplainabilityRollout(
  input: ExplainabilityRolloutInput,
): ExplainabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const explainabilityTableCoverageComplete =
    input.existingExplainabilityTableCount === CRITICAL_EXPLAINABILITY_TABLES.length

  const checks: ExplainabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL explainability checks can reach the database.'
            : 'Production explainability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'explainability_signal_table_coverage',
      label: 'Explainability signal table coverage',
      status: explainabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Explainability signal table coverage is only enforced in production.'
          : explainabilityTableCoverageComplete
            ? `${input.existingExplainabilityTableCount}/${CRITICAL_EXPLAINABILITY_TABLES.length} explainability signal tables are present.`
            : `${input.existingExplainabilityTableCount}/${CRITICAL_EXPLAINABILITY_TABLES.length} explainability signal tables were found.`,
    },
    {
      name: 'synthesis_explainability',
      label: 'Synthesis explainability',
      status: input.moderatorSynthesesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Synthesis explainability is only enforced in production.'
          : input.moderatorSynthesesTableExists
            ? 'moderator_syntheses table is available for synthesis explainability signals.'
            : 'Production explainability rollout requires a moderator_syntheses table.',
    },
    {
      name: 'agent_output_explainability',
      label: 'Agent output explainability',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output explainability is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output explainability signals.'
            : 'Production explainability rollout requires a agent_outputs table.',
    },
    {
      name: 'interpretation_readiness_signal',
      label: 'Interpretation readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          explainabilityTableCoverageComplete &&
          input.moderatorSynthesesTableExists &&
          input.agentOutputsTableExists &&
          input.artifactsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Interpretation readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              explainabilityTableCoverageComplete &&
              input.moderatorSynthesesTableExists &&
              input.agentOutputsTableExists &&
              input.artifactsTableExists
            ? 'Moderator syntheses, agent outputs, and persisted artifacts support interpretation readiness.'
            : 'Production explainability rollout requires PostgreSQL connectivity, explainability tables, synthesis explainability, agent output explainability, and full signal coverage.',
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
        ? 'Production explainability rollout checks passed. Explainability coverage and interpretation readiness signal signals are healthy.'
        : 'Production explainability rollout is not ready. Resolve failed checks before relying on production explainability tooling.',
  }
}

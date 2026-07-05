import type { ApiEnv } from '../config/env.js'

export const CRITICAL_EXPRESSIVENESS_TABLES = [
  'agent_outputs',
  'moderator_syntheses',
  'artifacts',
] as const

export type ExpressivenessRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ExpressivenessRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ExpressivenessRolloutCheck[]
  guidance: string
}

export type ExpressivenessRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingExpressivenessTableCount: number
  agentOutputsTableExists: boolean
  moderatorSynthesesTableExists: boolean
  artifactsTableExists: boolean
}

export function evaluateExpressivenessRollout(
  input: ExpressivenessRolloutInput,
): ExpressivenessRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const expressivenessTableCoverageComplete =
    input.existingExpressivenessTableCount === CRITICAL_EXPRESSIVENESS_TABLES.length

  const checks: ExpressivenessRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL expressiveness checks can reach the database.'
            : 'Production expressiveness rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'expressiveness_signal_table_coverage',
      label: 'Expressiveness signal table coverage',
      status: expressivenessTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Expressiveness signal table coverage is only enforced in production.'
          : expressivenessTableCoverageComplete
            ? `${input.existingExpressivenessTableCount}/${CRITICAL_EXPRESSIVENESS_TABLES.length} expressiveness signal tables are present.`
            : `${input.existingExpressivenessTableCount}/${CRITICAL_EXPRESSIVENESS_TABLES.length} expressiveness signal tables were found.`,
    },
    {
      name: 'agent_output_expressiveness',
      label: 'Agent output expressiveness',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output expressiveness is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output expressiveness signals.'
            : 'Production expressiveness rollout requires a agent_outputs table.',
    },
    {
      name: 'synthesis_expressiveness',
      label: 'Synthesis expressiveness',
      status: input.moderatorSynthesesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Synthesis expressiveness is only enforced in production.'
          : input.moderatorSynthesesTableExists
            ? 'moderator_syntheses table is available for synthesis expressiveness signals.'
            : 'Production expressiveness rollout requires a moderator_syntheses table.',
    },
    {
      name: 'expression_readiness_signal',
      label: 'Expression readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          expressivenessTableCoverageComplete &&
          input.agentOutputsTableExists &&
          input.moderatorSynthesesTableExists &&
          input.artifactsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Expression readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              expressivenessTableCoverageComplete &&
              input.agentOutputsTableExists &&
              input.moderatorSynthesesTableExists &&
              input.artifactsTableExists
            ? 'Agent outputs, moderator syntheses, and persisted artifacts support expression readiness.'
            : 'Production expressiveness rollout requires PostgreSQL connectivity, expressiveness tables, agent output expressiveness, synthesis expressiveness, and full signal coverage.',
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
        ? 'Production expressiveness rollout checks passed. Expressiveness coverage and expression readiness signal signals are healthy.'
        : 'Production expressiveness rollout is not ready. Resolve failed checks before relying on production expressiveness tooling.',
  }
}

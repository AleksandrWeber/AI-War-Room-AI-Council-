import type { ApiEnv } from '../config/env.js'

export const CRITICAL_COMPREHENSIBILITY_TABLES = [
  'agent_outputs',
  'moderator_syntheses',
  'artifacts',
] as const

export type ComprehensibilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ComprehensibilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ComprehensibilityRolloutCheck[]
  guidance: string
}

export type ComprehensibilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingComprehensibilityTableCount: number
  agentOutputsTableExists: boolean
  moderatorSynthesesTableExists: boolean
  artifactsTableExists: boolean
}

export function evaluateComprehensibilityRollout(
  input: ComprehensibilityRolloutInput,
): ComprehensibilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const comprehensibilityTableCoverageComplete =
    input.existingComprehensibilityTableCount === CRITICAL_COMPREHENSIBILITY_TABLES.length

  const checks: ComprehensibilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL comprehensibility checks can reach the database.'
            : 'Production comprehensibility rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'comprehensibility_signal_table_coverage',
      label: 'Comprehensibility signal table coverage',
      status: comprehensibilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Comprehensibility signal table coverage is only enforced in production.'
          : comprehensibilityTableCoverageComplete
            ? `${input.existingComprehensibilityTableCount}/${CRITICAL_COMPREHENSIBILITY_TABLES.length} comprehensibility signal tables are present.`
            : `${input.existingComprehensibilityTableCount}/${CRITICAL_COMPREHENSIBILITY_TABLES.length} comprehensibility signal tables were found.`,
    },
    {
      name: 'agent_output_comprehensibility',
      label: 'Agent output comprehensibility',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output comprehensibility is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output comprehensibility signals.'
            : 'Production comprehensibility rollout requires a agent_outputs table.',
    },
    {
      name: 'synthesis_comprehensibility',
      label: 'Synthesis comprehensibility',
      status: input.moderatorSynthesesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Synthesis comprehensibility is only enforced in production.'
          : input.moderatorSynthesesTableExists
            ? 'moderator_syntheses table is available for synthesis comprehensibility signals.'
            : 'Production comprehensibility rollout requires a moderator_syntheses table.',
    },
    {
      name: 'comprehension_readiness_signal',
      label: 'Comprehension readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          comprehensibilityTableCoverageComplete &&
          input.agentOutputsTableExists &&
          input.moderatorSynthesesTableExists &&
          input.artifactsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Comprehension readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              comprehensibilityTableCoverageComplete &&
              input.agentOutputsTableExists &&
              input.moderatorSynthesesTableExists &&
              input.artifactsTableExists
            ? 'Agent outputs, moderator syntheses, and persisted artifacts support comprehension readiness.'
            : 'Production comprehensibility rollout requires PostgreSQL connectivity, comprehensibility tables, agent output comprehensibility, synthesis comprehensibility, and full signal coverage.',
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
        ? 'Production comprehensibility rollout checks passed. Comprehensibility coverage and comprehension readiness signal signals are healthy.'
        : 'Production comprehensibility rollout is not ready. Resolve failed checks before relying on production comprehensibility tooling.',
  }
}

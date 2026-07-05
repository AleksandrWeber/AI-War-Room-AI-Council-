import type { ApiEnv } from '../config/env.js'

export const CRITICAL_AUTHENTICITY_TABLES = [
  'moderator_syntheses',
  'agent_outputs',
  'artifacts',
] as const

export type AuthenticityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AuthenticityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AuthenticityRolloutCheck[]
  guidance: string
}

export type AuthenticityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAuthenticityTableCount: number
  moderatorSynthesesTableExists: boolean
  agentOutputsTableExists: boolean
  artifactsTableExists: boolean
}

export function evaluateAuthenticityRollout(
  input: AuthenticityRolloutInput,
): AuthenticityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const authenticityTableCoverageComplete =
    input.existingAuthenticityTableCount === CRITICAL_AUTHENTICITY_TABLES.length

  const checks: AuthenticityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL authenticity checks can reach the database.'
            : 'Production authenticity rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'authenticity_signal_table_coverage',
      label: 'Authenticity signal table coverage',
      status: authenticityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Authenticity signal table coverage is only enforced in production.'
          : authenticityTableCoverageComplete
            ? `${input.existingAuthenticityTableCount}/${CRITICAL_AUTHENTICITY_TABLES.length} authenticity signal tables are present.`
            : `${input.existingAuthenticityTableCount}/${CRITICAL_AUTHENTICITY_TABLES.length} authenticity signal tables were found.`,
    },
    {
      name: 'synthesis_authenticity',
      label: 'Synthesis authenticity',
      status: input.moderatorSynthesesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Synthesis authenticity is only enforced in production.'
          : input.moderatorSynthesesTableExists
            ? 'moderator_syntheses table is available for synthesis authenticity signals.'
            : 'Production authenticity rollout requires a moderator_syntheses table.',
    },
    {
      name: 'agent_output_authenticity',
      label: 'Agent output authenticity',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output authenticity is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output authenticity signals.'
            : 'Production authenticity rollout requires a agent_outputs table.',
    },
    {
      name: 'origin_readiness_signal',
      label: 'Origin readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          authenticityTableCoverageComplete &&
          input.moderatorSynthesesTableExists &&
          input.agentOutputsTableExists &&
          input.artifactsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Origin readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              authenticityTableCoverageComplete &&
              input.moderatorSynthesesTableExists &&
              input.agentOutputsTableExists &&
              input.artifactsTableExists
            ? 'Moderator syntheses, agent outputs, and persisted artifacts support origin readiness.'
            : 'Production authenticity rollout requires PostgreSQL connectivity, authenticity tables, synthesis authenticity, agent output authenticity, and full signal coverage.',
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
        ? 'Production authenticity rollout checks passed. Authenticity coverage and origin readiness signal signals are healthy.'
        : 'Production authenticity rollout is not ready. Resolve failed checks before relying on production authenticity tooling.',
  }
}

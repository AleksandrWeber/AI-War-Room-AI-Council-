import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PORTABILITY_TABLES = [
  'artifacts',
  'agent_outputs',
  'moderator_syntheses',
] as const

export type PortabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type PortabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: PortabilityRolloutCheck[]
  guidance: string
}

export type PortabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingPortabilityTableCount: number
  artifactsTableExists: boolean
  agentOutputsTableExists: boolean
  moderatorSynthesesTableExists: boolean
}

export function evaluatePortabilityRollout(
  input: PortabilityRolloutInput,
): PortabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const portabilityTableCoverageComplete =
    input.existingPortabilityTableCount === CRITICAL_PORTABILITY_TABLES.length

  const checks: PortabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL portability checks can reach the database.'
            : 'Production portability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'portability_signal_table_coverage',
      label: 'Portability signal table coverage',
      status: portabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Portability signal table coverage is only enforced in production.'
          : portabilityTableCoverageComplete
            ? `${input.existingPortabilityTableCount}/${CRITICAL_PORTABILITY_TABLES.length} portability signal tables are present.`
            : `${input.existingPortabilityTableCount}/${CRITICAL_PORTABILITY_TABLES.length} portability signal tables were found.`,
    },
    {
      name: 'artifact_portability',
      label: 'Artifact portability',
      status: input.artifactsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Artifact portability is only enforced in production.'
          : input.artifactsTableExists
            ? 'artifacts table is available for artifact portability signals.'
            : 'Production portability rollout requires a artifacts table.',
    },
    {
      name: 'agent_output_portability',
      label: 'Agent output portability',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output portability is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output portability signals.'
            : 'Production portability rollout requires a agent_outputs table.',
    },
    {
      name: 'portability_readiness_signal',
      label: 'Portability readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          portabilityTableCoverageComplete &&
          input.artifactsTableExists &&
          input.agentOutputsTableExists &&
          input.moderatorSynthesesTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Portability readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              portabilityTableCoverageComplete &&
              input.artifactsTableExists &&
              input.agentOutputsTableExists &&
              input.moderatorSynthesesTableExists
            ? 'Persisted artifacts, agent outputs, and moderator syntheses support portability readiness.'
            : 'Production portability rollout requires PostgreSQL connectivity, portability tables, artifact portability, agent output portability, and full signal coverage.',
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
        ? 'Production portability rollout checks passed. Portability coverage and portability readiness signal signals are healthy.'
        : 'Production portability rollout is not ready. Resolve failed checks before relying on production portability tooling.',
  }
}

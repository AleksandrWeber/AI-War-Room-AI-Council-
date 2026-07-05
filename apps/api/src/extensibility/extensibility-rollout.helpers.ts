import type { ApiEnv } from '../config/env.js'

export const CRITICAL_EXTENSIBILITY_TABLES = [
  'agent_outputs',
  'artifacts',
  'moderator_syntheses',
] as const

export type ExtensibilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ExtensibilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ExtensibilityRolloutCheck[]
  guidance: string
}

export type ExtensibilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingExtensibilityTableCount: number
  agentOutputsTableExists: boolean
  artifactsTableExists: boolean
  moderatorSynthesesTableExists: boolean
}

export function evaluateExtensibilityRollout(
  input: ExtensibilityRolloutInput,
): ExtensibilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const extensibilityTableCoverageComplete =
    input.existingExtensibilityTableCount === CRITICAL_EXTENSIBILITY_TABLES.length

  const checks: ExtensibilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL extensibility checks can reach the database.'
            : 'Production extensibility rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'extensibility_signal_table_coverage',
      label: 'Extensibility signal table coverage',
      status: extensibilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Extensibility signal table coverage is only enforced in production.'
          : extensibilityTableCoverageComplete
            ? `${input.existingExtensibilityTableCount}/${CRITICAL_EXTENSIBILITY_TABLES.length} extensibility signal tables are present.`
            : `${input.existingExtensibilityTableCount}/${CRITICAL_EXTENSIBILITY_TABLES.length} extensibility signal tables were found.`,
    },
    {
      name: 'agent_output_extensibility',
      label: 'Agent output extensibility',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output extensibility is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output extensibility signals.'
            : 'Production extensibility rollout requires a agent_outputs table.',
    },
    {
      name: 'artifact_extensibility',
      label: 'Artifact extensibility',
      status: input.artifactsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Artifact extensibility is only enforced in production.'
          : input.artifactsTableExists
            ? 'artifacts table is available for artifact extensibility signals.'
            : 'Production extensibility rollout requires a artifacts table.',
    },
    {
      name: 'extension_readiness_signal',
      label: 'Extension readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          extensibilityTableCoverageComplete &&
          input.agentOutputsTableExists &&
          input.artifactsTableExists &&
          input.moderatorSynthesesTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Extension readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              extensibilityTableCoverageComplete &&
              input.agentOutputsTableExists &&
              input.artifactsTableExists &&
              input.moderatorSynthesesTableExists
            ? 'Agent outputs, persisted artifacts, and moderator syntheses support extension readiness.'
            : 'Production extensibility rollout requires PostgreSQL connectivity, extensibility tables, agent output extensibility, artifact extensibility, and full signal coverage.',
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
        ? 'Production extensibility rollout checks passed. Extensibility coverage and extension readiness signal signals are healthy.'
        : 'Production extensibility rollout is not ready. Resolve failed checks before relying on production extensibility tooling.',
  }
}

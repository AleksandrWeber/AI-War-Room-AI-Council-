import type { ApiEnv } from '../config/env.js'

export const CRITICAL_COMPOSABILITY_TABLES = [
  'run_workflows',
  'agent_outputs',
  'artifacts',
] as const

export type ComposabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ComposabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ComposabilityRolloutCheck[]
  guidance: string
}

export type ComposabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingComposabilityTableCount: number
  runWorkflowsTableExists: boolean
  agentOutputsTableExists: boolean
  artifactsTableExists: boolean
}

export function evaluateComposabilityRollout(
  input: ComposabilityRolloutInput,
): ComposabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const composabilityTableCoverageComplete =
    input.existingComposabilityTableCount === CRITICAL_COMPOSABILITY_TABLES.length

  const checks: ComposabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL composability checks can reach the database.'
            : 'Production composability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'composability_signal_table_coverage',
      label: 'Composability signal table coverage',
      status: composabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Composability signal table coverage is only enforced in production.'
          : composabilityTableCoverageComplete
            ? `${input.existingComposabilityTableCount}/${CRITICAL_COMPOSABILITY_TABLES.length} composability signal tables are present.`
            : `${input.existingComposabilityTableCount}/${CRITICAL_COMPOSABILITY_TABLES.length} composability signal tables were found.`,
    },
    {
      name: 'workflow_composability',
      label: 'Workflow composability',
      status: input.runWorkflowsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workflow composability is only enforced in production.'
          : input.runWorkflowsTableExists
            ? 'run_workflows table is available for workflow composability signals.'
            : 'Production composability rollout requires a run_workflows table.',
    },
    {
      name: 'agent_output_composability',
      label: 'Agent output composability',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output composability is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output composability signals.'
            : 'Production composability rollout requires a agent_outputs table.',
    },
    {
      name: 'composition_readiness_signal',
      label: 'Composition readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          composabilityTableCoverageComplete &&
          input.runWorkflowsTableExists &&
          input.agentOutputsTableExists &&
          input.artifactsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Composition readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              composabilityTableCoverageComplete &&
              input.runWorkflowsTableExists &&
              input.agentOutputsTableExists &&
              input.artifactsTableExists
            ? 'Run workflows, agent outputs, and persisted artifacts support composition readiness.'
            : 'Production composability rollout requires PostgreSQL connectivity, composability tables, workflow composability, agent output composability, and full signal coverage.',
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
        ? 'Production composability rollout checks passed. Composability coverage and composition readiness signal signals are healthy.'
        : 'Production composability rollout is not ready. Resolve failed checks before relying on production composability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PROGRAMMABILITY_TABLES = [
  'run_workflows',
  'agent_outputs',
  'artifacts',
] as const

export type ProgrammabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ProgrammabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ProgrammabilityRolloutCheck[]
  guidance: string
}

export type ProgrammabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingProgrammabilityTableCount: number
  runWorkflowsTableExists: boolean
  agentOutputsTableExists: boolean
  artifactsTableExists: boolean
}

export function evaluateProgrammabilityRollout(
  input: ProgrammabilityRolloutInput,
): ProgrammabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const programmabilityTableCoverageComplete =
    input.existingProgrammabilityTableCount === CRITICAL_PROGRAMMABILITY_TABLES.length

  const checks: ProgrammabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL programmability checks can reach the database.'
            : 'Production programmability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'programmability_signal_table_coverage',
      label: 'Programmability signal table coverage',
      status: programmabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Programmability signal table coverage is only enforced in production.'
          : programmabilityTableCoverageComplete
            ? `${input.existingProgrammabilityTableCount}/${CRITICAL_PROGRAMMABILITY_TABLES.length} programmability signal tables are present.`
            : `${input.existingProgrammabilityTableCount}/${CRITICAL_PROGRAMMABILITY_TABLES.length} programmability signal tables were found.`,
    },
    {
      name: 'workflow_programmability',
      label: 'Workflow programmability',
      status: input.runWorkflowsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workflow programmability is only enforced in production.'
          : input.runWorkflowsTableExists
            ? 'run_workflows table is available for workflow programmability signals.'
            : 'Production programmability rollout requires a run_workflows table.',
    },
    {
      name: 'agent_output_programmability',
      label: 'Agent output programmability',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output programmability is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output programmability signals.'
            : 'Production programmability rollout requires a agent_outputs table.',
    },
    {
      name: 'programming_readiness_signal',
      label: 'Programming readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          programmabilityTableCoverageComplete &&
          input.runWorkflowsTableExists &&
          input.agentOutputsTableExists &&
          input.artifactsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Programming readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              programmabilityTableCoverageComplete &&
              input.runWorkflowsTableExists &&
              input.agentOutputsTableExists &&
              input.artifactsTableExists
            ? 'Run workflows, agent outputs, and persisted artifacts support programming readiness.'
            : 'Production programmability rollout requires PostgreSQL connectivity, programmability tables, workflow programmability, agent output programmability, and full signal coverage.',
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
        ? 'Production programmability rollout checks passed. Programmability coverage and programming readiness signal signals are healthy.'
        : 'Production programmability rollout is not ready. Resolve failed checks before relying on production programmability tooling.',
  }
}

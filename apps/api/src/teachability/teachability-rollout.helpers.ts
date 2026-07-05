import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TEACHABILITY_TABLES = [
  'run_workflows',
  'agent_outputs',
  'workspace_memberships',
] as const

export type TeachabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TeachabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TeachabilityRolloutCheck[]
  guidance: string
}

export type TeachabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTeachabilityTableCount: number
  runWorkflowsTableExists: boolean
  agentOutputsTableExists: boolean
  workspaceMembershipsTableExists: boolean
}

export function evaluateTeachabilityRollout(
  input: TeachabilityRolloutInput,
): TeachabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const teachabilityTableCoverageComplete =
    input.existingTeachabilityTableCount === CRITICAL_TEACHABILITY_TABLES.length

  const checks: TeachabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL teachability checks can reach the database.'
            : 'Production teachability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'teachability_signal_table_coverage',
      label: 'Teachability signal table coverage',
      status: teachabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Teachability signal table coverage is only enforced in production.'
          : teachabilityTableCoverageComplete
            ? `${input.existingTeachabilityTableCount}/${CRITICAL_TEACHABILITY_TABLES.length} teachability signal tables are present.`
            : `${input.existingTeachabilityTableCount}/${CRITICAL_TEACHABILITY_TABLES.length} teachability signal tables were found.`,
    },
    {
      name: 'workflow_teachability',
      label: 'Workflow teachability',
      status: input.runWorkflowsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workflow teachability is only enforced in production.'
          : input.runWorkflowsTableExists
            ? 'run_workflows table is available for workflow teachability signals.'
            : 'Production teachability rollout requires a run_workflows table.',
    },
    {
      name: 'agent_output_teachability',
      label: 'Agent output teachability',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output teachability is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output teachability signals.'
            : 'Production teachability rollout requires a agent_outputs table.',
    },
    {
      name: 'teaching_readiness_signal',
      label: 'Teaching readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          teachabilityTableCoverageComplete &&
          input.runWorkflowsTableExists &&
          input.agentOutputsTableExists &&
          input.workspaceMembershipsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Teaching readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              teachabilityTableCoverageComplete &&
              input.runWorkflowsTableExists &&
              input.agentOutputsTableExists &&
              input.workspaceMembershipsTableExists
            ? 'Run workflows, agent outputs, and workspace memberships support teaching readiness.'
            : 'Production teachability rollout requires PostgreSQL connectivity, teachability tables, workflow teachability, agent output teachability, and full signal coverage.',
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
        ? 'Production teachability rollout checks passed. Teachability coverage and teaching readiness signal signals are healthy.'
        : 'Production teachability rollout is not ready. Resolve failed checks before relying on production teachability tooling.',
  }
}

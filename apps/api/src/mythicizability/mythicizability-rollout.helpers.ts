import type { ApiEnv } from '../config/env.js'

export const CRITICAL_MYTHICIZABILITY_TABLES = [
  'artifacts',
  'run_workflows',
  'billing_notifications',
] as const

export type MythicizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type MythicizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: MythicizabilityRolloutCheck[]
  guidance: string
}

export type MythicizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingMythicizabilityTableCount: number
  artifactsTableExists: boolean
  runWorkflowsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateMythicizabilityRollout(
  input: MythicizabilityRolloutInput,
): MythicizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const mythicizabilityTableCoverageComplete =
    input.existingMythicizabilityTableCount === CRITICAL_MYTHICIZABILITY_TABLES.length

  const checks: MythicizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL mythicizability checks can reach the database.'
            : 'Production mythicizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'mythicizability_signal_table_coverage',
      label: 'Mythicizability signal table coverage',
      status: mythicizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Mythicizability signal table coverage is only enforced in production.'
          : mythicizabilityTableCoverageComplete
            ? `${input.existingMythicizabilityTableCount}/${CRITICAL_MYTHICIZABILITY_TABLES.length} mythicizability signal tables are present.`
            : `${input.existingMythicizabilityTableCount}/${CRITICAL_MYTHICIZABILITY_TABLES.length} mythicizability signal tables were found.`,
    },
    {
      name: 'artifact_mythicizability',
      label: 'Artifact mythicizability',
      status: input.artifactsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Artifact mythicizability is only enforced in production.'
          : input.artifactsTableExists
            ? 'artifacts table is available for artifact mythicizability signals.'
            : 'Production mythicizability rollout requires a artifacts table.',
    },
    {
      name: 'workflow_mythicizability',
      label: 'Workflow mythicizability',
      status: input.runWorkflowsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workflow mythicizability is only enforced in production.'
          : input.runWorkflowsTableExists
            ? 'run_workflows table is available for workflow mythicizability signals.'
            : 'Production mythicizability rollout requires a run_workflows table.',
    },
    {
      name: 'mythicization_readiness_signal',
      label: 'Mythicization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          mythicizabilityTableCoverageComplete &&
          input.artifactsTableExists &&
          input.runWorkflowsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Mythicization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              mythicizabilityTableCoverageComplete &&
              input.artifactsTableExists &&
              input.runWorkflowsTableExists &&
              input.billingNotificationsTableExists
            ? 'Artifacts, run workflows, and billing notifications support mythicization readiness.'
            : 'Production mythicizability rollout requires PostgreSQL connectivity, mythicizability tables, artifact mythicizability, workflow mythicizability, and full signal coverage.',
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
        ? 'Production mythicizability rollout checks passed. Mythicizability coverage and mythicization readiness signal signals are healthy.'
        : 'Production mythicizability rollout is not ready. Resolve failed checks before relying on production mythicizability tooling.',
  }
}

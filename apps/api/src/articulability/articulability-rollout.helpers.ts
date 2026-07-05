import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ARTICULABILITY_TABLES = [
  'artifacts',
  'run_workflows',
  'billing_notifications',
] as const

export type ArticulabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ArticulabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ArticulabilityRolloutCheck[]
  guidance: string
}

export type ArticulabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingArticulabilityTableCount: number
  artifactsTableExists: boolean
  runWorkflowsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateArticulabilityRollout(
  input: ArticulabilityRolloutInput,
): ArticulabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const articulabilityTableCoverageComplete =
    input.existingArticulabilityTableCount === CRITICAL_ARTICULABILITY_TABLES.length

  const checks: ArticulabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL articulability checks can reach the database.'
            : 'Production articulability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'articulability_signal_table_coverage',
      label: 'Articulability signal table coverage',
      status: articulabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Articulability signal table coverage is only enforced in production.'
          : articulabilityTableCoverageComplete
            ? `${input.existingArticulabilityTableCount}/${CRITICAL_ARTICULABILITY_TABLES.length} articulability signal tables are present.`
            : `${input.existingArticulabilityTableCount}/${CRITICAL_ARTICULABILITY_TABLES.length} articulability signal tables were found.`,
    },
    {
      name: 'artifact_articulability',
      label: 'Artifact articulability',
      status: input.artifactsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Artifact articulability is only enforced in production.'
          : input.artifactsTableExists
            ? 'artifacts table is available for artifact articulability signals.'
            : 'Production articulability rollout requires a artifacts table.',
    },
    {
      name: 'workflow_articulability',
      label: 'Workflow articulability',
      status: input.runWorkflowsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workflow articulability is only enforced in production.'
          : input.runWorkflowsTableExists
            ? 'run_workflows table is available for workflow articulability signals.'
            : 'Production articulability rollout requires a run_workflows table.',
    },
    {
      name: 'articulation_readiness_signal',
      label: 'Articulation readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          articulabilityTableCoverageComplete &&
          input.artifactsTableExists &&
          input.runWorkflowsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Articulation readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              articulabilityTableCoverageComplete &&
              input.artifactsTableExists &&
              input.runWorkflowsTableExists &&
              input.billingNotificationsTableExists
            ? 'Artifacts, run workflows, and billing notifications support articulation readiness.'
            : 'Production articulability rollout requires PostgreSQL connectivity, articulability tables, artifact articulability, workflow articulability, and full signal coverage.',
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
        ? 'Production articulability rollout checks passed. Articulability coverage and articulation readiness signal signals are healthy.'
        : 'Production articulability rollout is not ready. Resolve failed checks before relying on production articulability tooling.',
  }
}

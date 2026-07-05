import type { ApiEnv } from '../config/env.js'

export const CRITICAL_MATERIALIZABILITY_TABLES = [
  'run_workflows',
  'artifacts',
  'billing_notifications',
] as const

export type MaterializabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type MaterializabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: MaterializabilityRolloutCheck[]
  guidance: string
}

export type MaterializabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingMaterializabilityTableCount: number
  runWorkflowsTableExists: boolean
  artifactsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateMaterializabilityRollout(
  input: MaterializabilityRolloutInput,
): MaterializabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const materializabilityTableCoverageComplete =
    input.existingMaterializabilityTableCount === CRITICAL_MATERIALIZABILITY_TABLES.length

  const checks: MaterializabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL materializability checks can reach the database.'
            : 'Production materializability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'materializability_signal_table_coverage',
      label: 'Materializability signal table coverage',
      status: materializabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Materializability signal table coverage is only enforced in production.'
          : materializabilityTableCoverageComplete
            ? `${input.existingMaterializabilityTableCount}/${CRITICAL_MATERIALIZABILITY_TABLES.length} materializability signal tables are present.`
            : `${input.existingMaterializabilityTableCount}/${CRITICAL_MATERIALIZABILITY_TABLES.length} materializability signal tables were found.`,
    },
    {
      name: 'workflow_materializability',
      label: 'Workflow materializability',
      status: input.runWorkflowsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workflow materializability is only enforced in production.'
          : input.runWorkflowsTableExists
            ? 'run_workflows table is available for workflow materializability signals.'
            : 'Production materializability rollout requires a run_workflows table.',
    },
    {
      name: 'artifact_materializability',
      label: 'Artifact materializability',
      status: input.artifactsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Artifact materializability is only enforced in production.'
          : input.artifactsTableExists
            ? 'artifacts table is available for artifact materializability signals.'
            : 'Production materializability rollout requires a artifacts table.',
    },
    {
      name: 'materialization_readiness_signal',
      label: 'Materialization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          materializabilityTableCoverageComplete &&
          input.runWorkflowsTableExists &&
          input.artifactsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Materialization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              materializabilityTableCoverageComplete &&
              input.runWorkflowsTableExists &&
              input.artifactsTableExists &&
              input.billingNotificationsTableExists
            ? 'Run workflows, artifacts, and billing notifications support materialization readiness.'
            : 'Production materializability rollout requires PostgreSQL connectivity, materializability tables, workflow materializability, artifact materializability, and full signal coverage.',
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
        ? 'Production materializability rollout checks passed. Materializability coverage and materialization readiness signal signals are healthy.'
        : 'Production materializability rollout is not ready. Resolve failed checks before relying on production materializability tooling.',
  }
}

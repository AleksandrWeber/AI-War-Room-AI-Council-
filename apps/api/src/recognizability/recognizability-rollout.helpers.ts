import type { ApiEnv } from '../config/env.js'

export const CRITICAL_RECOGNIZABILITY_TABLES = [
  'artifacts',
  'run_workflows',
  'billing_notifications',
] as const

export type RecognizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RecognizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RecognizabilityRolloutCheck[]
  guidance: string
}

export type RecognizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRecognizabilityTableCount: number
  artifactsTableExists: boolean
  runWorkflowsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateRecognizabilityRollout(
  input: RecognizabilityRolloutInput,
): RecognizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const recognizabilityTableCoverageComplete =
    input.existingRecognizabilityTableCount === CRITICAL_RECOGNIZABILITY_TABLES.length

  const checks: RecognizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL recognizability checks can reach the database.'
            : 'Production recognizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'recognizability_signal_table_coverage',
      label: 'Recognizability signal table coverage',
      status: recognizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Recognizability signal table coverage is only enforced in production.'
          : recognizabilityTableCoverageComplete
            ? `${input.existingRecognizabilityTableCount}/${CRITICAL_RECOGNIZABILITY_TABLES.length} recognizability signal tables are present.`
            : `${input.existingRecognizabilityTableCount}/${CRITICAL_RECOGNIZABILITY_TABLES.length} recognizability signal tables were found.`,
    },
    {
      name: 'artifact_recognizability',
      label: 'Artifact recognizability',
      status: input.artifactsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Artifact recognizability is only enforced in production.'
          : input.artifactsTableExists
            ? 'artifacts table is available for artifact recognizability signals.'
            : 'Production recognizability rollout requires a artifacts table.',
    },
    {
      name: 'workflow_recognizability',
      label: 'Workflow recognizability',
      status: input.runWorkflowsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workflow recognizability is only enforced in production.'
          : input.runWorkflowsTableExists
            ? 'run_workflows table is available for workflow recognizability signals.'
            : 'Production recognizability rollout requires a run_workflows table.',
    },
    {
      name: 'recognition_readiness_signal',
      label: 'Recognition readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          recognizabilityTableCoverageComplete &&
          input.artifactsTableExists &&
          input.runWorkflowsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Recognition readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              recognizabilityTableCoverageComplete &&
              input.artifactsTableExists &&
              input.runWorkflowsTableExists &&
              input.billingNotificationsTableExists
            ? 'Artifacts, run workflows, and billing notifications support recognition readiness.'
            : 'Production recognizability rollout requires PostgreSQL connectivity, recognizability tables, artifact recognizability, workflow recognizability, and full signal coverage.',
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
        ? 'Production recognizability rollout checks passed. Recognizability coverage and recognition readiness signal signals are healthy.'
        : 'Production recognizability rollout is not ready. Resolve failed checks before relying on production recognizability tooling.',
  }
}

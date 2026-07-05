import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DEMONSTRABILITY_TABLES = [
  'run_workflows',
  'artifacts',
  'billing_notifications',
] as const

export type DemonstrabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DemonstrabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DemonstrabilityRolloutCheck[]
  guidance: string
}

export type DemonstrabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDemonstrabilityTableCount: number
  runWorkflowsTableExists: boolean
  artifactsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateDemonstrabilityRollout(
  input: DemonstrabilityRolloutInput,
): DemonstrabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const demonstrabilityTableCoverageComplete =
    input.existingDemonstrabilityTableCount === CRITICAL_DEMONSTRABILITY_TABLES.length

  const checks: DemonstrabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL demonstrability checks can reach the database.'
            : 'Production demonstrability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'demonstrability_signal_table_coverage',
      label: 'Demonstrability signal table coverage',
      status: demonstrabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Demonstrability signal table coverage is only enforced in production.'
          : demonstrabilityTableCoverageComplete
            ? `${input.existingDemonstrabilityTableCount}/${CRITICAL_DEMONSTRABILITY_TABLES.length} demonstrability signal tables are present.`
            : `${input.existingDemonstrabilityTableCount}/${CRITICAL_DEMONSTRABILITY_TABLES.length} demonstrability signal tables were found.`,
    },
    {
      name: 'workflow_demonstrability',
      label: 'Workflow demonstrability',
      status: input.runWorkflowsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workflow demonstrability is only enforced in production.'
          : input.runWorkflowsTableExists
            ? 'run_workflows table is available for workflow demonstrability signals.'
            : 'Production demonstrability rollout requires a run_workflows table.',
    },
    {
      name: 'artifact_demonstrability',
      label: 'Artifact demonstrability',
      status: input.artifactsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Artifact demonstrability is only enforced in production.'
          : input.artifactsTableExists
            ? 'artifacts table is available for artifact demonstrability signals.'
            : 'Production demonstrability rollout requires a artifacts table.',
    },
    {
      name: 'presentation_readiness_signal',
      label: 'Presentation readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          demonstrabilityTableCoverageComplete &&
          input.runWorkflowsTableExists &&
          input.artifactsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Presentation readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              demonstrabilityTableCoverageComplete &&
              input.runWorkflowsTableExists &&
              input.artifactsTableExists &&
              input.billingNotificationsTableExists
            ? 'Run workflows, persisted artifacts, and billing notifications support presentation readiness.'
            : 'Production demonstrability rollout requires PostgreSQL connectivity, demonstrability tables, workflow demonstrability, artifact demonstrability, and full signal coverage.',
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
        ? 'Production demonstrability rollout checks passed. Demonstrability coverage and presentation readiness signal signals are healthy.'
        : 'Production demonstrability rollout is not ready. Resolve failed checks before relying on production demonstrability tooling.',
  }
}

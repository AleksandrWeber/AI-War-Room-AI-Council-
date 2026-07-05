import type { ApiEnv } from '../config/env.js'

export const CRITICAL_REFERENCABILITY_TABLES = [
  'artifacts',
  'run_workflows',
  'billing_records',
] as const

export type ReferencabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ReferencabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ReferencabilityRolloutCheck[]
  guidance: string
}

export type ReferencabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingReferencabilityTableCount: number
  artifactsTableExists: boolean
  runWorkflowsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateReferencabilityRollout(
  input: ReferencabilityRolloutInput,
): ReferencabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const referencabilityTableCoverageComplete =
    input.existingReferencabilityTableCount === CRITICAL_REFERENCABILITY_TABLES.length

  const checks: ReferencabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL referencability checks can reach the database.'
            : 'Production referencability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'referencability_signal_table_coverage',
      label: 'Referencability signal table coverage',
      status: referencabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Referencability signal table coverage is only enforced in production.'
          : referencabilityTableCoverageComplete
            ? `${input.existingReferencabilityTableCount}/${CRITICAL_REFERENCABILITY_TABLES.length} referencability signal tables are present.`
            : `${input.existingReferencabilityTableCount}/${CRITICAL_REFERENCABILITY_TABLES.length} referencability signal tables were found.`,
    },
    {
      name: 'artifact_referencability',
      label: 'Artifact referencability',
      status: input.artifactsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Artifact referencability is only enforced in production.'
          : input.artifactsTableExists
            ? 'artifacts table is available for artifact referencability signals.'
            : 'Production referencability rollout requires a artifacts table.',
    },
    {
      name: 'workflow_referencability',
      label: 'Workflow referencability',
      status: input.runWorkflowsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workflow referencability is only enforced in production.'
          : input.runWorkflowsTableExists
            ? 'run_workflows table is available for workflow referencability signals.'
            : 'Production referencability rollout requires a run_workflows table.',
    },
    {
      name: 'reference_readiness_signal',
      label: 'Reference readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          referencabilityTableCoverageComplete &&
          input.artifactsTableExists &&
          input.runWorkflowsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Reference readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              referencabilityTableCoverageComplete &&
              input.artifactsTableExists &&
              input.runWorkflowsTableExists &&
              input.billingRecordsTableExists
            ? 'Persisted artifacts, run workflows, and billing records support reference readiness.'
            : 'Production referencability rollout requires PostgreSQL connectivity, referencability tables, artifact referencability, workflow referencability, and full signal coverage.',
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
        ? 'Production referencability rollout checks passed. Referencability coverage and reference readiness signal signals are healthy.'
        : 'Production referencability rollout is not ready. Resolve failed checks before relying on production referencability tooling.',
  }
}

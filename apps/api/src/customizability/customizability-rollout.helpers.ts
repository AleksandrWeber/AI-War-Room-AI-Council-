import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CUSTOMIZABILITY_TABLES = [
  'run_workflows',
  'artifacts',
  'usage_events',
] as const

export type CustomizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CustomizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CustomizabilityRolloutCheck[]
  guidance: string
}

export type CustomizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCustomizabilityTableCount: number
  runWorkflowsTableExists: boolean
  artifactsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateCustomizabilityRollout(
  input: CustomizabilityRolloutInput,
): CustomizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const customizabilityTableCoverageComplete =
    input.existingCustomizabilityTableCount === CRITICAL_CUSTOMIZABILITY_TABLES.length

  const checks: CustomizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL customizability checks can reach the database.'
            : 'Production customizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'customizability_signal_table_coverage',
      label: 'Customizability signal table coverage',
      status: customizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Customizability signal table coverage is only enforced in production.'
          : customizabilityTableCoverageComplete
            ? `${input.existingCustomizabilityTableCount}/${CRITICAL_CUSTOMIZABILITY_TABLES.length} customizability signal tables are present.`
            : `${input.existingCustomizabilityTableCount}/${CRITICAL_CUSTOMIZABILITY_TABLES.length} customizability signal tables were found.`,
    },
    {
      name: 'workflow_customizability',
      label: 'Workflow customizability',
      status: input.runWorkflowsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workflow customizability is only enforced in production.'
          : input.runWorkflowsTableExists
            ? 'run_workflows table is available for workflow customizability signals.'
            : 'Production customizability rollout requires a run_workflows table.',
    },
    {
      name: 'artifact_customizability',
      label: 'Artifact customizability',
      status: input.artifactsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Artifact customizability is only enforced in production.'
          : input.artifactsTableExists
            ? 'artifacts table is available for artifact customizability signals.'
            : 'Production customizability rollout requires a artifacts table.',
    },
    {
      name: 'customization_readiness_signal',
      label: 'Customization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          customizabilityTableCoverageComplete &&
          input.runWorkflowsTableExists &&
          input.artifactsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Customization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              customizabilityTableCoverageComplete &&
              input.runWorkflowsTableExists &&
              input.artifactsTableExists &&
              input.usageEventsTableExists
            ? 'Run workflows, persisted artifacts, and usage events support customization readiness.'
            : 'Production customizability rollout requires PostgreSQL connectivity, customizability tables, workflow customizability, artifact customizability, and full signal coverage.',
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
        ? 'Production customizability rollout checks passed. Customizability coverage and customization readiness signal signals are healthy.'
        : 'Production customizability rollout is not ready. Resolve failed checks before relying on production customizability tooling.',
  }
}

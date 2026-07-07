import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PROVISIONINGIZABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type ProvisioningizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ProvisioningizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ProvisioningizabilityRolloutCheck[]
  guidance: string
}

export type ProvisioningizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingProvisioningizabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateProvisioningizabilityRollout(
  input: ProvisioningizabilityRolloutInput,
): ProvisioningizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const provisioningizabilityTableCoverageComplete =
    input.existingProvisioningizabilityTableCount === CRITICAL_PROVISIONINGIZABILITY_TABLES.length

  const checks: ProvisioningizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL provisioningizability checks can reach the database.'
            : 'Production provisioningizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'provisioningizability_signal_table_coverage',
      label: 'Provisioningizability signal table coverage',
      status: provisioningizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provisioningizability signal table coverage is only enforced in production.'
          : provisioningizabilityTableCoverageComplete
            ? `${input.existingProvisioningizabilityTableCount}/${CRITICAL_PROVISIONINGIZABILITY_TABLES.length} provisioningizability signal tables are present.`
            : `${input.existingProvisioningizabilityTableCount}/${CRITICAL_PROVISIONINGIZABILITY_TABLES.length} provisioningizability signal tables were found.`,
    },
    {
      name: 'workspace_limit_provisioningizability',
      label: 'Workspace limit provisioningizability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit provisioningizability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit provisioningizability signals.'
            : 'Production provisioningizability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_provisioningizability',
      label: 'Usage event provisioningizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event provisioningizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event provisioningizability signals.'
            : 'Production provisioningizability rollout requires a usage_events table.',
    },
    {
      name: 'provisioningization_readiness_signal',
      label: 'Federatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          provisioningizabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Federatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              provisioningizabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support provisioningization readiness.'
            : 'Production provisioningizability rollout requires PostgreSQL connectivity, provisioningizability tables, workspace limit provisioningizability, usage event provisioningizability, and full signal coverage.',
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
        ? 'Production provisioningizability rollout checks passed. Provisioningizability coverage and federatization readiness signal signals are healthy.'
        : 'Production provisioningizability rollout is not ready. Resolve failed checks before relying on production provisioningizability tooling.',
  }
}

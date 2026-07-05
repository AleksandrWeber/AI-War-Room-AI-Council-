import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ASSIGNABILITY_TABLES = [
  'workspace_memberships',
  'workspace_provider_credentials',
  'billing_notifications',
] as const

export type AssignabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AssignabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AssignabilityRolloutCheck[]
  guidance: string
}

export type AssignabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAssignabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateAssignabilityRollout(
  input: AssignabilityRolloutInput,
): AssignabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const assignabilityTableCoverageComplete =
    input.existingAssignabilityTableCount === CRITICAL_ASSIGNABILITY_TABLES.length

  const checks: AssignabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL assignability checks can reach the database.'
            : 'Production assignability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'assignability_signal_table_coverage',
      label: 'Assignability signal table coverage',
      status: assignabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Assignability signal table coverage is only enforced in production.'
          : assignabilityTableCoverageComplete
            ? `${input.existingAssignabilityTableCount}/${CRITICAL_ASSIGNABILITY_TABLES.length} assignability signal tables are present.`
            : `${input.existingAssignabilityTableCount}/${CRITICAL_ASSIGNABILITY_TABLES.length} assignability signal tables were found.`,
    },
    {
      name: 'workspace_membership_assignability',
      label: 'Workspace membership assignability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace membership assignability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for workspace membership assignability signals.'
            : 'Production assignability rollout requires a workspace_memberships table.',
    },
    {
      name: 'provider_credential_assignability',
      label: 'Provider credential assignability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential assignability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential assignability signals.'
            : 'Production assignability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'assignment_readiness_signal',
      label: 'Assignment readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          assignabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Assignment readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              assignabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, provider credentials, and billing notifications support assignment readiness.'
            : 'Production assignability rollout requires PostgreSQL connectivity, assignability tables, workspace membership assignability, provider credential assignability, and full signal coverage.',
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
        ? 'Production assignability rollout checks passed. Assignability coverage and assignment readiness signal signals are healthy.'
        : 'Production assignability rollout is not ready. Resolve failed checks before relying on production assignability tooling.',
  }
}

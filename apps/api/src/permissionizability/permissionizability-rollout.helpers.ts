import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PERMISSIONIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type PermissionizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type PermissionizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: PermissionizabilityRolloutCheck[]
  guidance: string
}

export type PermissionizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingPermissionizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluatePermissionizabilityRollout(
  input: PermissionizabilityRolloutInput,
): PermissionizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const permissionizabilityTableCoverageComplete =
    input.existingPermissionizabilityTableCount === CRITICAL_PERMISSIONIZABILITY_TABLES.length

  const checks: PermissionizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL permissionizability checks can reach the database.'
            : 'Production permissionizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'permissionizability_signal_table_coverage',
      label: 'Permissionizability signal table coverage',
      status: permissionizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Permissionizability signal table coverage is only enforced in production.'
          : permissionizabilityTableCoverageComplete
            ? `${input.existingPermissionizabilityTableCount}/${CRITICAL_PERMISSIONIZABILITY_TABLES.length} permissionizability signal tables are present.`
            : `${input.existingPermissionizabilityTableCount}/${CRITICAL_PERMISSIONIZABILITY_TABLES.length} permissionizability signal tables were found.`,
    },
    {
      name: 'membership_permissionizability',
      label: 'Membership permissionizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership permissionizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership permissionizability signals.'
            : 'Production permissionizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_permissionizability',
      label: 'Usage event permissionizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event permissionizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event permissionizability signals.'
            : 'Production permissionizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          permissionizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              permissionizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production permissionizability rollout requires PostgreSQL connectivity, permissionizability tables, membership permissionizability, usage event permissionizability, and full signal coverage.',
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
        ? 'Production permissionizability rollout checks passed. Permissionizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production permissionizability rollout is not ready. Resolve failed checks before relying on production permissionizability tooling.',
  }
}

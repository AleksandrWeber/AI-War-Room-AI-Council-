import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DIRECTORYIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type DirectoryizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DirectoryizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DirectoryizabilityRolloutCheck[]
  guidance: string
}

export type DirectoryizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDirectoryizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateDirectoryizabilityRollout(
  input: DirectoryizabilityRolloutInput,
): DirectoryizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const directoryizabilityTableCoverageComplete =
    input.existingDirectoryizabilityTableCount === CRITICAL_DIRECTORYIZABILITY_TABLES.length

  const checks: DirectoryizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL directoryizability checks can reach the database.'
            : 'Production directoryizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'directoryizability_signal_table_coverage',
      label: 'Directoryizability signal table coverage',
      status: directoryizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Directoryizability signal table coverage is only enforced in production.'
          : directoryizabilityTableCoverageComplete
            ? `${input.existingDirectoryizabilityTableCount}/${CRITICAL_DIRECTORYIZABILITY_TABLES.length} directoryizability signal tables are present.`
            : `${input.existingDirectoryizabilityTableCount}/${CRITICAL_DIRECTORYIZABILITY_TABLES.length} directoryizability signal tables were found.`,
    },
    {
      name: 'membership_directoryizability',
      label: 'Membership directoryizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership directoryizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership directoryizability signals.'
            : 'Production directoryizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_directoryizability',
      label: 'Usage event directoryizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event directoryizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event directoryizability signals.'
            : 'Production directoryizability rollout requires a usage_events table.',
    },
    {
      name: 'directorization_readiness_signal',
      label: 'Directorization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          directoryizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Directorization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              directoryizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support directorization readiness.'
            : 'Production directoryizability rollout requires PostgreSQL connectivity, directoryizability tables, membership directoryizability, usage event directoryizability, and full signal coverage.',
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
        ? 'Production directoryizability rollout checks passed. Directoryizability coverage and directorization readiness signal signals are healthy.'
        : 'Production directoryizability rollout is not ready. Resolve failed checks before relying on production directoryizability tooling.',
  }
}

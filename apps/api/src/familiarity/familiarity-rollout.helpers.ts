import type { ApiEnv } from '../config/env.js'

export const CRITICAL_FAMILIARITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type FamiliarityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type FamiliarityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: FamiliarityRolloutCheck[]
  guidance: string
}

export type FamiliarityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingFamiliarityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateFamiliarityRollout(
  input: FamiliarityRolloutInput,
): FamiliarityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const familiarityTableCoverageComplete =
    input.existingFamiliarityTableCount === CRITICAL_FAMILIARITY_TABLES.length

  const checks: FamiliarityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL familiarity checks can reach the database.'
            : 'Production familiarity rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'familiarity_signal_table_coverage',
      label: 'Familiarity signal table coverage',
      status: familiarityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Familiarity signal table coverage is only enforced in production.'
          : familiarityTableCoverageComplete
            ? `${input.existingFamiliarityTableCount}/${CRITICAL_FAMILIARITY_TABLES.length} familiarity signal tables are present.`
            : `${input.existingFamiliarityTableCount}/${CRITICAL_FAMILIARITY_TABLES.length} familiarity signal tables were found.`,
    },
    {
      name: 'membership_familiarity',
      label: 'Membership familiarity',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership familiarity is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership familiarity signals.'
            : 'Production familiarity rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_familiarity',
      label: 'Usage event familiarity',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event familiarity is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event familiarity signals.'
            : 'Production familiarity rollout requires a usage_events table.',
    },
    {
      name: 'familiarity_readiness_signal',
      label: 'Familiarity readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          familiarityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Familiarity readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              familiarityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support familiarity readiness.'
            : 'Production familiarity rollout requires PostgreSQL connectivity, familiarity tables, membership familiarity, usage event familiarity, and full signal coverage.',
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
        ? 'Production familiarity rollout checks passed. Familiarity coverage and familiarity readiness signal signals are healthy.'
        : 'Production familiarity rollout is not ready. Resolve failed checks before relying on production familiarity tooling.',
  }
}

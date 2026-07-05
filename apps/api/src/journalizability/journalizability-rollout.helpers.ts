import type { ApiEnv } from '../config/env.js'

export const CRITICAL_JOURNALIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type JournalizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type JournalizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: JournalizabilityRolloutCheck[]
  guidance: string
}

export type JournalizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingJournalizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateJournalizabilityRollout(
  input: JournalizabilityRolloutInput,
): JournalizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const journalizabilityTableCoverageComplete =
    input.existingJournalizabilityTableCount === CRITICAL_JOURNALIZABILITY_TABLES.length

  const checks: JournalizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL journalizability checks can reach the database.'
            : 'Production journalizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'journalizability_signal_table_coverage',
      label: 'Journalizability signal table coverage',
      status: journalizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Journalizability signal table coverage is only enforced in production.'
          : journalizabilityTableCoverageComplete
            ? `${input.existingJournalizabilityTableCount}/${CRITICAL_JOURNALIZABILITY_TABLES.length} journalizability signal tables are present.`
            : `${input.existingJournalizabilityTableCount}/${CRITICAL_JOURNALIZABILITY_TABLES.length} journalizability signal tables were found.`,
    },
    {
      name: 'membership_journalizability',
      label: 'Membership journalizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership journalizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership journalizability signals.'
            : 'Production journalizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_journalizability',
      label: 'Usage event journalizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event journalizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event journalizability signals.'
            : 'Production journalizability rollout requires a usage_events table.',
    },
    {
      name: 'journalization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          journalizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              journalizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support journalization readiness.'
            : 'Production journalizability rollout requires PostgreSQL connectivity, journalizability tables, membership journalizability, usage event journalizability, and full signal coverage.',
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
        ? 'Production journalizability rollout checks passed. Journalizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production journalizability rollout is not ready. Resolve failed checks before relying on production journalizability tooling.',
  }
}

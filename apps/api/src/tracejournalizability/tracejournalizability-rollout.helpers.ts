import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TRACEJOURNALIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type TracejournalizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TracejournalizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TracejournalizabilityRolloutCheck[]
  guidance: string
}

export type TracejournalizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTracejournalizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateTracejournalizabilityRollout(
  input: TracejournalizabilityRolloutInput,
): TracejournalizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const tracejournalizabilityTableCoverageComplete =
    input.existingTracejournalizabilityTableCount === CRITICAL_TRACEJOURNALIZABILITY_TABLES.length

  const checks: TracejournalizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL tracejournalizability checks can reach the database.'
            : 'Production tracejournalizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'tracejournalizability_signal_table_coverage',
      label: 'Tracejournalizability signal table coverage',
      status: tracejournalizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Tracejournalizability signal table coverage is only enforced in production.'
          : tracejournalizabilityTableCoverageComplete
            ? `${input.existingTracejournalizabilityTableCount}/${CRITICAL_TRACEJOURNALIZABILITY_TABLES.length} tracejournalizability signal tables are present.`
            : `${input.existingTracejournalizabilityTableCount}/${CRITICAL_TRACEJOURNALIZABILITY_TABLES.length} tracejournalizability signal tables were found.`,
    },
    {
      name: 'membership_tracejournalizability',
      label: 'Membership tracejournalizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership tracejournalizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership tracejournalizability signals.'
            : 'Production tracejournalizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_tracejournalizability',
      label: 'Usage event tracejournalizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event tracejournalizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event tracejournalizability signals.'
            : 'Production tracejournalizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          tracejournalizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              tracejournalizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production tracejournalizability rollout requires PostgreSQL connectivity, tracejournalizability tables, membership tracejournalizability, usage event tracejournalizability, and full signal coverage.',
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
        ? 'Production tracejournalizability rollout checks passed. Tracejournalizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production tracejournalizability rollout is not ready. Resolve failed checks before relying on production tracejournalizability tooling.',
  }
}

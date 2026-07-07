import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TRACEVAULTIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type TracevaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TracevaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TracevaultizabilityRolloutCheck[]
  guidance: string
}

export type TracevaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTracevaultizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateTracevaultizabilityRollout(
  input: TracevaultizabilityRolloutInput,
): TracevaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const tracevaultizabilityTableCoverageComplete =
    input.existingTracevaultizabilityTableCount === CRITICAL_TRACEVAULTIZABILITY_TABLES.length

  const checks: TracevaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL tracevaultizability checks can reach the database.'
            : 'Production tracevaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'tracevaultizability_signal_table_coverage',
      label: 'Tracevaultizability signal table coverage',
      status: tracevaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Tracevaultizability signal table coverage is only enforced in production.'
          : tracevaultizabilityTableCoverageComplete
            ? `${input.existingTracevaultizabilityTableCount}/${CRITICAL_TRACEVAULTIZABILITY_TABLES.length} tracevaultizability signal tables are present.`
            : `${input.existingTracevaultizabilityTableCount}/${CRITICAL_TRACEVAULTIZABILITY_TABLES.length} tracevaultizability signal tables were found.`,
    },
    {
      name: 'membership_tracevaultizability',
      label: 'Membership tracevaultizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership tracevaultizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership tracevaultizability signals.'
            : 'Production tracevaultizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_tracevaultizability',
      label: 'Usage event tracevaultizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event tracevaultizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event tracevaultizability signals.'
            : 'Production tracevaultizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          tracevaultizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              tracevaultizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production tracevaultizability rollout requires PostgreSQL connectivity, tracevaultizability tables, membership tracevaultizability, usage event tracevaultizability, and full signal coverage.',
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
        ? 'Production tracevaultizability rollout checks passed. Tracevaultizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production tracevaultizability rollout is not ready. Resolve failed checks before relying on production tracevaultizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_MAINTAINABILIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type MaintainabilizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type MaintainabilizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: MaintainabilizabilityRolloutCheck[]
  guidance: string
}

export type MaintainabilizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingMaintainabilizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateMaintainabilizabilityRollout(
  input: MaintainabilizabilityRolloutInput,
): MaintainabilizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const maintainabilizabilityTableCoverageComplete =
    input.existingMaintainabilizabilityTableCount === CRITICAL_MAINTAINABILIZABILITY_TABLES.length

  const checks: MaintainabilizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL maintainabilizability checks can reach the database.'
            : 'Production maintainabilizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'maintainabilizability_signal_table_coverage',
      label: 'Maintainabilizability signal table coverage',
      status: maintainabilizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Maintainabilizability signal table coverage is only enforced in production.'
          : maintainabilizabilityTableCoverageComplete
            ? `${input.existingMaintainabilizabilityTableCount}/${CRITICAL_MAINTAINABILIZABILITY_TABLES.length} maintainabilizability signal tables are present.`
            : `${input.existingMaintainabilizabilityTableCount}/${CRITICAL_MAINTAINABILIZABILITY_TABLES.length} maintainabilizability signal tables were found.`,
    },
    {
      name: 'membership_maintainabilizability',
      label: 'Membership maintainabilizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership maintainabilizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership maintainabilizability signals.'
            : 'Production maintainabilizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_maintainabilizability',
      label: 'Usage event maintainabilizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event maintainabilizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event maintainabilizability signals.'
            : 'Production maintainabilizability rollout requires a usage_events table.',
    },
    {
      name: 'maintainabilization_readiness_signal',
      label: 'Maintainabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          maintainabilizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Maintainabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              maintainabilizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support maintainabilization readiness.'
            : 'Production maintainabilizability rollout requires PostgreSQL connectivity, maintainabilizability tables, membership maintainabilizability, usage event maintainabilizability, and full signal coverage.',
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
        ? 'Production maintainabilizability rollout checks passed. Maintainabilizability coverage and maintainabilization readiness signal signals are healthy.'
        : 'Production maintainabilizability rollout is not ready. Resolve failed checks before relying on production maintainabilizability tooling.',
  }
}

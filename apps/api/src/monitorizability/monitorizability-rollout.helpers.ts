import type { ApiEnv } from '../config/env.js'

export const CRITICAL_MONITORIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type MonitorizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type MonitorizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: MonitorizabilityRolloutCheck[]
  guidance: string
}

export type MonitorizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingMonitorizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateMonitorizabilityRollout(
  input: MonitorizabilityRolloutInput,
): MonitorizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const monitorizabilityTableCoverageComplete =
    input.existingMonitorizabilityTableCount === CRITICAL_MONITORIZABILITY_TABLES.length

  const checks: MonitorizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL monitorizability checks can reach the database.'
            : 'Production monitorizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'monitorizability_signal_table_coverage',
      label: 'Monitorizability signal table coverage',
      status: monitorizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Monitorizability signal table coverage is only enforced in production.'
          : monitorizabilityTableCoverageComplete
            ? `${input.existingMonitorizabilityTableCount}/${CRITICAL_MONITORIZABILITY_TABLES.length} monitorizability signal tables are present.`
            : `${input.existingMonitorizabilityTableCount}/${CRITICAL_MONITORIZABILITY_TABLES.length} monitorizability signal tables were found.`,
    },
    {
      name: 'membership_monitorizability',
      label: 'Membership monitorizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership monitorizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership monitorizability signals.'
            : 'Production monitorizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_monitorizability',
      label: 'Usage event monitorizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event monitorizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event monitorizability signals.'
            : 'Production monitorizability rollout requires a usage_events table.',
    },
    {
      name: 'monitorization_readiness_signal',
      label: 'Monitorization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          monitorizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Monitorization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              monitorizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support monitorization readiness.'
            : 'Production monitorizability rollout requires PostgreSQL connectivity, monitorizability tables, membership monitorizability, usage event monitorizability, and full signal coverage.',
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
        ? 'Production monitorizability rollout checks passed. Monitorizability coverage and monitorization readiness signal signals are healthy.'
        : 'Production monitorizability rollout is not ready. Resolve failed checks before relying on production monitorizability tooling.',
  }
}

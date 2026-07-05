import type { ApiEnv } from '../config/env.js'

export const CRITICAL_EVENTIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type EventizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type EventizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: EventizabilityRolloutCheck[]
  guidance: string
}

export type EventizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingEventizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateEventizabilityRollout(
  input: EventizabilityRolloutInput,
): EventizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const eventizabilityTableCoverageComplete =
    input.existingEventizabilityTableCount === CRITICAL_EVENTIZABILITY_TABLES.length

  const checks: EventizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL eventizability checks can reach the database.'
            : 'Production eventizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'eventizability_signal_table_coverage',
      label: 'Eventizability signal table coverage',
      status: eventizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Eventizability signal table coverage is only enforced in production.'
          : eventizabilityTableCoverageComplete
            ? `${input.existingEventizabilityTableCount}/${CRITICAL_EVENTIZABILITY_TABLES.length} eventizability signal tables are present.`
            : `${input.existingEventizabilityTableCount}/${CRITICAL_EVENTIZABILITY_TABLES.length} eventizability signal tables were found.`,
    },
    {
      name: 'membership_eventizability',
      label: 'Membership eventizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership eventizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership eventizability signals.'
            : 'Production eventizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_eventizability',
      label: 'Usage event eventizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event eventizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event eventizability signals.'
            : 'Production eventizability rollout requires a usage_events table.',
    },
    {
      name: 'eventization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          eventizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              eventizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support eventization readiness.'
            : 'Production eventizability rollout requires PostgreSQL connectivity, eventizability tables, membership eventizability, usage event eventizability, and full signal coverage.',
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
        ? 'Production eventizability rollout checks passed. Eventizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production eventizability rollout is not ready. Resolve failed checks before relying on production eventizability tooling.',
  }
}

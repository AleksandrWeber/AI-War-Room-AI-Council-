import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ASYNCHRONIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type AsynchronizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AsynchronizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AsynchronizabilityRolloutCheck[]
  guidance: string
}

export type AsynchronizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAsynchronizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateAsynchronizabilityRollout(
  input: AsynchronizabilityRolloutInput,
): AsynchronizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const asynchronizabilityTableCoverageComplete =
    input.existingAsynchronizabilityTableCount === CRITICAL_ASYNCHRONIZABILITY_TABLES.length

  const checks: AsynchronizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL asynchronizability checks can reach the database.'
            : 'Production asynchronizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'asynchronizability_signal_table_coverage',
      label: 'Asynchronizability signal table coverage',
      status: asynchronizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Asynchronizability signal table coverage is only enforced in production.'
          : asynchronizabilityTableCoverageComplete
            ? `${input.existingAsynchronizabilityTableCount}/${CRITICAL_ASYNCHRONIZABILITY_TABLES.length} asynchronizability signal tables are present.`
            : `${input.existingAsynchronizabilityTableCount}/${CRITICAL_ASYNCHRONIZABILITY_TABLES.length} asynchronizability signal tables were found.`,
    },
    {
      name: 'membership_asynchronizability',
      label: 'Membership asynchronizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership asynchronizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership asynchronizability signals.'
            : 'Production asynchronizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_asynchronizability',
      label: 'Usage event asynchronizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event asynchronizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event asynchronizability signals.'
            : 'Production asynchronizability rollout requires a usage_events table.',
    },
    {
      name: 'asynchronization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          asynchronizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              asynchronizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support asynchronization readiness.'
            : 'Production asynchronizability rollout requires PostgreSQL connectivity, asynchronizability tables, membership asynchronizability, usage event asynchronizability, and full signal coverage.',
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
        ? 'Production asynchronizability rollout checks passed. Asynchronizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production asynchronizability rollout is not ready. Resolve failed checks before relying on production asynchronizability tooling.',
  }
}

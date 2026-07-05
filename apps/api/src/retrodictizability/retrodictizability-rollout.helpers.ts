import type { ApiEnv } from '../config/env.js'

export const CRITICAL_RETRODICTIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type RetrodictizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RetrodictizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RetrodictizabilityRolloutCheck[]
  guidance: string
}

export type RetrodictizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRetrodictizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateRetrodictizabilityRollout(
  input: RetrodictizabilityRolloutInput,
): RetrodictizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const retrodictizabilityTableCoverageComplete =
    input.existingRetrodictizabilityTableCount === CRITICAL_RETRODICTIZABILITY_TABLES.length

  const checks: RetrodictizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL retrodictizability checks can reach the database.'
            : 'Production retrodictizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'retrodictizability_signal_table_coverage',
      label: 'Retrodictizability signal table coverage',
      status: retrodictizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Retrodictizability signal table coverage is only enforced in production.'
          : retrodictizabilityTableCoverageComplete
            ? `${input.existingRetrodictizabilityTableCount}/${CRITICAL_RETRODICTIZABILITY_TABLES.length} retrodictizability signal tables are present.`
            : `${input.existingRetrodictizabilityTableCount}/${CRITICAL_RETRODICTIZABILITY_TABLES.length} retrodictizability signal tables were found.`,
    },
    {
      name: 'membership_retrodictizability',
      label: 'Membership retrodictizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership retrodictizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership retrodictizability signals.'
            : 'Production retrodictizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_retrodictizability',
      label: 'Usage event retrodictizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event retrodictizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event retrodictizability signals.'
            : 'Production retrodictizability rollout requires a usage_events table.',
    },
    {
      name: 'retrodictization_readiness_signal',
      label: 'Retrodictization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          retrodictizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Retrodictization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              retrodictizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support retrodictization readiness.'
            : 'Production retrodictizability rollout requires PostgreSQL connectivity, retrodictizability tables, membership retrodictizability, usage event retrodictizability, and full signal coverage.',
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
        ? 'Production retrodictizability rollout checks passed. Retrodictizability coverage and retrodictization readiness signal signals are healthy.'
        : 'Production retrodictizability rollout is not ready. Resolve failed checks before relying on production retrodictizability tooling.',
  }
}

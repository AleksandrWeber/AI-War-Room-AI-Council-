import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CONSPICUOUSNESS_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type ConspicuousnessRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ConspicuousnessRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ConspicuousnessRolloutCheck[]
  guidance: string
}

export type ConspicuousnessRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingConspicuousnessTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateConspicuousnessRollout(
  input: ConspicuousnessRolloutInput,
): ConspicuousnessRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const conspicuousnessTableCoverageComplete =
    input.existingConspicuousnessTableCount === CRITICAL_CONSPICUOUSNESS_TABLES.length

  const checks: ConspicuousnessRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL conspicuousness checks can reach the database.'
            : 'Production conspicuousness rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'conspicuousness_signal_table_coverage',
      label: 'Conspicuousness signal table coverage',
      status: conspicuousnessTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Conspicuousness signal table coverage is only enforced in production.'
          : conspicuousnessTableCoverageComplete
            ? `${input.existingConspicuousnessTableCount}/${CRITICAL_CONSPICUOUSNESS_TABLES.length} conspicuousness signal tables are present.`
            : `${input.existingConspicuousnessTableCount}/${CRITICAL_CONSPICUOUSNESS_TABLES.length} conspicuousness signal tables were found.`,
    },
    {
      name: 'membership_conspicuousness',
      label: 'Membership conspicuousness',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership conspicuousness is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership conspicuousness signals.'
            : 'Production conspicuousness rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_conspicuousness',
      label: 'Usage event conspicuousness',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event conspicuousness is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event conspicuousness signals.'
            : 'Production conspicuousness rollout requires a usage_events table.',
    },
    {
      name: 'conspicuousness_readiness_signal',
      label: 'Conspicuousness readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          conspicuousnessTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Conspicuousness readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              conspicuousnessTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support conspicuousness readiness.'
            : 'Production conspicuousness rollout requires PostgreSQL connectivity, conspicuousness tables, membership conspicuousness, usage event conspicuousness, and full signal coverage.',
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
        ? 'Production conspicuousness rollout checks passed. Conspicuousness coverage and conspicuousness readiness signal signals are healthy.'
        : 'Production conspicuousness rollout is not ready. Resolve failed checks before relying on production conspicuousness tooling.',
  }
}

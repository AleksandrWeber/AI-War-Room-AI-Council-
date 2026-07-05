import type { ApiEnv } from '../config/env.js'

export const CRITICAL_USABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type UsabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type UsabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: UsabilityRolloutCheck[]
  guidance: string
}

export type UsabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingUsabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateUsabilityRollout(
  input: UsabilityRolloutInput,
): UsabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const usabilityTableCoverageComplete =
    input.existingUsabilityTableCount === CRITICAL_USABILITY_TABLES.length

  const checks: UsabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL usability checks can reach the database.'
            : 'Production usability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'usability_signal_table_coverage',
      label: 'Usability signal table coverage',
      status: usabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usability signal table coverage is only enforced in production.'
          : usabilityTableCoverageComplete
            ? `${input.existingUsabilityTableCount}/${CRITICAL_USABILITY_TABLES.length} usability signal tables are present.`
            : `${input.existingUsabilityTableCount}/${CRITICAL_USABILITY_TABLES.length} usability signal tables were found.`,
    },
    {
      name: 'membership_usability',
      label: 'Membership usability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership usability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership usability signals.'
            : 'Production usability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_usability',
      label: 'Usage event usability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event usability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event usability signals.'
            : 'Production usability rollout requires a usage_events table.',
    },
    {
      name: 'usage_readiness_signal',
      label: 'Usage readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          usabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Usage readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              usabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support usage readiness.'
            : 'Production usability rollout requires PostgreSQL connectivity, usability tables, membership usability, usage event usability, and full signal coverage.',
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
        ? 'Production usability rollout checks passed. Usability coverage and usage readiness signal signals are healthy.'
        : 'Production usability rollout is not ready. Resolve failed checks before relying on production usability tooling.',
  }
}

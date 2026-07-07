import type { ApiEnv } from '../config/env.js'

export const CRITICAL_NOTARJOURNALIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type NotarjournalizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type NotarjournalizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: NotarjournalizabilityRolloutCheck[]
  guidance: string
}

export type NotarjournalizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingNotarjournalizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateNotarjournalizabilityRollout(
  input: NotarjournalizabilityRolloutInput,
): NotarjournalizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const notarjournalizabilityTableCoverageComplete =
    input.existingNotarjournalizabilityTableCount === CRITICAL_NOTARJOURNALIZABILITY_TABLES.length

  const checks: NotarjournalizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL notarjournalizability checks can reach the database.'
            : 'Production notarjournalizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'notarjournalizability_signal_table_coverage',
      label: 'Notarjournalizability signal table coverage',
      status: notarjournalizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Notarjournalizability signal table coverage is only enforced in production.'
          : notarjournalizabilityTableCoverageComplete
            ? `${input.existingNotarjournalizabilityTableCount}/${CRITICAL_NOTARJOURNALIZABILITY_TABLES.length} notarjournalizability signal tables are present.`
            : `${input.existingNotarjournalizabilityTableCount}/${CRITICAL_NOTARJOURNALIZABILITY_TABLES.length} notarjournalizability signal tables were found.`,
    },
    {
      name: 'membership_notarjournalizability',
      label: 'Membership notarjournalizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership notarjournalizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership notarjournalizability signals.'
            : 'Production notarjournalizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_notarjournalizability',
      label: 'Usage event notarjournalizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event notarjournalizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event notarjournalizability signals.'
            : 'Production notarjournalizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          notarjournalizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              notarjournalizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production notarjournalizability rollout requires PostgreSQL connectivity, notarjournalizability tables, membership notarjournalizability, usage event notarjournalizability, and full signal coverage.',
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
        ? 'Production notarjournalizability rollout checks passed. Notarjournalizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production notarjournalizability rollout is not ready. Resolve failed checks before relying on production notarjournalizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DESIRABILITY_TABLES = [
  'usage_events',
  'billing_notifications',
  'workspace_memberships',
] as const

export type DesirabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DesirabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DesirabilityRolloutCheck[]
  guidance: string
}

export type DesirabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDesirabilityTableCount: number
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
  workspaceMembershipsTableExists: boolean
}

export function evaluateDesirabilityRollout(
  input: DesirabilityRolloutInput,
): DesirabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const desirabilityTableCoverageComplete =
    input.existingDesirabilityTableCount === CRITICAL_DESIRABILITY_TABLES.length

  const checks: DesirabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL desirability checks can reach the database.'
            : 'Production desirability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'desirability_signal_table_coverage',
      label: 'Desirability signal table coverage',
      status: desirabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Desirability signal table coverage is only enforced in production.'
          : desirabilityTableCoverageComplete
            ? `${input.existingDesirabilityTableCount}/${CRITICAL_DESIRABILITY_TABLES.length} desirability signal tables are present.`
            : `${input.existingDesirabilityTableCount}/${CRITICAL_DESIRABILITY_TABLES.length} desirability signal tables were found.`,
    },
    {
      name: 'usage_event_desirability',
      label: 'Usage event desirability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event desirability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event desirability signals.'
            : 'Production desirability rollout requires a usage_events table.',
    },
    {
      name: 'billing_notification_desirability',
      label: 'Billing notification desirability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification desirability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification desirability signals.'
            : 'Production desirability rollout requires a billing_notifications table.',
    },
    {
      name: 'desirability_readiness_signal',
      label: 'Desirability readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          desirabilityTableCoverageComplete &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists &&
          input.workspaceMembershipsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Desirability readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              desirabilityTableCoverageComplete &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists &&
              input.workspaceMembershipsTableExists
            ? 'Usage events, billing notifications, and workspace memberships support desirability readiness.'
            : 'Production desirability rollout requires PostgreSQL connectivity, desirability tables, usage event desirability, billing notification desirability, and full signal coverage.',
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
        ? 'Production desirability rollout checks passed. Desirability coverage and desirability readiness signal signals are healthy.'
        : 'Production desirability rollout is not ready. Resolve failed checks before relying on production desirability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ABATCHIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type RetryizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RetryizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RetryizabilityRolloutCheck[]
  guidance: string
}

export type RetryizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRetryizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateRetryizabilityRollout(
  input: RetryizabilityRolloutInput,
): RetryizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const retryizabilityTableCoverageComplete =
    input.existingRetryizabilityTableCount === CRITICAL_ABATCHIZABILITY_TABLES.length

  const checks: RetryizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL retryizability checks can reach the database.'
            : 'Production retryizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'retryizability_signal_table_coverage',
      label: 'Retryizability signal table coverage',
      status: retryizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Retryizability signal table coverage is only enforced in production.'
          : retryizabilityTableCoverageComplete
            ? `${input.existingRetryizabilityTableCount}/${CRITICAL_ABATCHIZABILITY_TABLES.length} retryizability signal tables are present.`
            : `${input.existingRetryizabilityTableCount}/${CRITICAL_ABATCHIZABILITY_TABLES.length} retryizability signal tables were found.`,
    },
    {
      name: 'membership_retryizability',
      label: 'Membership retryizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership retryizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership retryizability signals.'
            : 'Production retryizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_retryizability',
      label: 'Usage event retryizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event retryizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event retryizability signals.'
            : 'Production retryizability rollout requires a usage_events table.',
    },
    {
      name: 'retryization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          retryizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              retryizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support retryization readiness.'
            : 'Production retryizability rollout requires PostgreSQL connectivity, retryizability tables, membership retryizability, usage event retryizability, and full signal coverage.',
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
        ? 'Production retryizability rollout checks passed. Retryizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production retryizability rollout is not ready. Resolve failed checks before relying on production retryizability tooling.',
  }
}

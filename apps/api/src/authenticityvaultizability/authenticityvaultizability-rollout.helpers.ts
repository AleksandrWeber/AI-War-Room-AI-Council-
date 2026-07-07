import type { ApiEnv } from '../config/env.js'

export const CRITICAL_AUTHENTICITYVAULTIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type AuthenticityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AuthenticityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AuthenticityvaultizabilityRolloutCheck[]
  guidance: string
}

export type AuthenticityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAuthenticityvaultizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateAuthenticityvaultizabilityRollout(
  input: AuthenticityvaultizabilityRolloutInput,
): AuthenticityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const authenticityvaultizabilityTableCoverageComplete =
    input.existingAuthenticityvaultizabilityTableCount === CRITICAL_AUTHENTICITYVAULTIZABILITY_TABLES.length

  const checks: AuthenticityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL authenticityvaultizability checks can reach the database.'
            : 'Production authenticityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'authenticityvaultizability_signal_table_coverage',
      label: 'Authenticityvaultizability signal table coverage',
      status: authenticityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Authenticityvaultizability signal table coverage is only enforced in production.'
          : authenticityvaultizabilityTableCoverageComplete
            ? `${input.existingAuthenticityvaultizabilityTableCount}/${CRITICAL_AUTHENTICITYVAULTIZABILITY_TABLES.length} authenticityvaultizability signal tables are present.`
            : `${input.existingAuthenticityvaultizabilityTableCount}/${CRITICAL_AUTHENTICITYVAULTIZABILITY_TABLES.length} authenticityvaultizability signal tables were found.`,
    },
    {
      name: 'membership_authenticityvaultizability',
      label: 'Membership authenticityvaultizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership authenticityvaultizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership authenticityvaultizability signals.'
            : 'Production authenticityvaultizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_authenticityvaultizability',
      label: 'Usage event authenticityvaultizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event authenticityvaultizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event authenticityvaultizability signals.'
            : 'Production authenticityvaultizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          authenticityvaultizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              authenticityvaultizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production authenticityvaultizability rollout requires PostgreSQL connectivity, authenticityvaultizability tables, membership authenticityvaultizability, usage event authenticityvaultizability, and full signal coverage.',
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
        ? 'Production authenticityvaultizability rollout checks passed. Authenticityvaultizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production authenticityvaultizability rollout is not ready. Resolve failed checks before relying on production authenticityvaultizability tooling.',
  }
}

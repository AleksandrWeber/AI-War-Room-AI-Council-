import type { ApiEnv } from '../config/env.js'

export const CRITICAL_KEYMANAGEMENTIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type KeymanagementizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type KeymanagementizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: KeymanagementizabilityRolloutCheck[]
  guidance: string
}

export type KeymanagementizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingKeymanagementizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateKeymanagementizabilityRollout(
  input: KeymanagementizabilityRolloutInput,
): KeymanagementizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const keymanagementizabilityTableCoverageComplete =
    input.existingKeymanagementizabilityTableCount === CRITICAL_KEYMANAGEMENTIZABILITY_TABLES.length

  const checks: KeymanagementizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL keymanagementizability checks can reach the database.'
            : 'Production keymanagementizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'keymanagementizability_signal_table_coverage',
      label: 'Keymanagementizability signal table coverage',
      status: keymanagementizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Keymanagementizability signal table coverage is only enforced in production.'
          : keymanagementizabilityTableCoverageComplete
            ? `${input.existingKeymanagementizabilityTableCount}/${CRITICAL_KEYMANAGEMENTIZABILITY_TABLES.length} keymanagementizability signal tables are present.`
            : `${input.existingKeymanagementizabilityTableCount}/${CRITICAL_KEYMANAGEMENTIZABILITY_TABLES.length} keymanagementizability signal tables were found.`,
    },
    {
      name: 'membership_keymanagementizability',
      label: 'Membership keymanagementizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership keymanagementizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership keymanagementizability signals.'
            : 'Production keymanagementizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_keymanagementizability',
      label: 'Usage event keymanagementizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event keymanagementizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event keymanagementizability signals.'
            : 'Production keymanagementizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          keymanagementizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              keymanagementizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production keymanagementizability rollout requires PostgreSQL connectivity, keymanagementizability tables, membership keymanagementizability, usage event keymanagementizability, and full signal coverage.',
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
        ? 'Production keymanagementizability rollout checks passed. Keymanagementizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production keymanagementizability rollout is not ready. Resolve failed checks before relying on production keymanagementizability tooling.',
  }
}

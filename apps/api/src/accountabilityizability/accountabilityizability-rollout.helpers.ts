import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ACCOUNTABILITYIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type AccountabilityizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AccountabilityizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AccountabilityizabilityRolloutCheck[]
  guidance: string
}

export type AccountabilityizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAccountabilityizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateAccountabilityizabilityRollout(
  input: AccountabilityizabilityRolloutInput,
): AccountabilityizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const accountabilityizabilityTableCoverageComplete =
    input.existingAccountabilityizabilityTableCount === CRITICAL_ACCOUNTABILITYIZABILITY_TABLES.length

  const checks: AccountabilityizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL accountabilityizability checks can reach the database.'
            : 'Production accountabilityizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'accountabilityizability_signal_table_coverage',
      label: 'Accountabilityizability signal table coverage',
      status: accountabilityizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Accountabilityizability signal table coverage is only enforced in production.'
          : accountabilityizabilityTableCoverageComplete
            ? `${input.existingAccountabilityizabilityTableCount}/${CRITICAL_ACCOUNTABILITYIZABILITY_TABLES.length} accountabilityizability signal tables are present.`
            : `${input.existingAccountabilityizabilityTableCount}/${CRITICAL_ACCOUNTABILITYIZABILITY_TABLES.length} accountabilityizability signal tables were found.`,
    },
    {
      name: 'membership_accountabilityizability',
      label: 'Membership accountabilityizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership accountabilityizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership accountabilityizability signals.'
            : 'Production accountabilityizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_accountabilityizability',
      label: 'Usage event accountabilityizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event accountabilityizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event accountabilityizability signals.'
            : 'Production accountabilityizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          accountabilityizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              accountabilityizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production accountabilityizability rollout requires PostgreSQL connectivity, accountabilityizability tables, membership accountabilityizability, usage event accountabilityizability, and full signal coverage.',
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
        ? 'Production accountabilityizability rollout checks passed. Accountabilityizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production accountabilityizability rollout is not ready. Resolve failed checks before relying on production accountabilityizability tooling.',
  }
}

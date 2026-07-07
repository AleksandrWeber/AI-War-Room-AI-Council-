import type { ApiEnv } from '../config/env.js'

export const CRITICAL_NOTARLEDGERIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type NotarledgerizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type NotarledgerizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: NotarledgerizabilityRolloutCheck[]
  guidance: string
}

export type NotarledgerizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingNotarledgerizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateNotarledgerizabilityRollout(
  input: NotarledgerizabilityRolloutInput,
): NotarledgerizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const notarledgerizabilityTableCoverageComplete =
    input.existingNotarledgerizabilityTableCount === CRITICAL_NOTARLEDGERIZABILITY_TABLES.length

  const checks: NotarledgerizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL notarledgerizability checks can reach the database.'
            : 'Production notarledgerizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'notarledgerizability_signal_table_coverage',
      label: 'Notarledgerizability signal table coverage',
      status: notarledgerizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Notarledgerizability signal table coverage is only enforced in production.'
          : notarledgerizabilityTableCoverageComplete
            ? `${input.existingNotarledgerizabilityTableCount}/${CRITICAL_NOTARLEDGERIZABILITY_TABLES.length} notarledgerizability signal tables are present.`
            : `${input.existingNotarledgerizabilityTableCount}/${CRITICAL_NOTARLEDGERIZABILITY_TABLES.length} notarledgerizability signal tables were found.`,
    },
    {
      name: 'membership_notarledgerizability',
      label: 'Membership notarledgerizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership notarledgerizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership notarledgerizability signals.'
            : 'Production notarledgerizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_notarledgerizability',
      label: 'Usage event notarledgerizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event notarledgerizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event notarledgerizability signals.'
            : 'Production notarledgerizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          notarledgerizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              notarledgerizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production notarledgerizability rollout requires PostgreSQL connectivity, notarledgerizability tables, membership notarledgerizability, usage event notarledgerizability, and full signal coverage.',
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
        ? 'Production notarledgerizability rollout checks passed. Notarledgerizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production notarledgerizability rollout is not ready. Resolve failed checks before relying on production notarledgerizability tooling.',
  }
}

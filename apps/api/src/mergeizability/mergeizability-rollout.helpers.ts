import type { ApiEnv } from '../config/env.js'

export const CRITICAL_MERGEIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type MergeizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type MergeizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: MergeizabilityRolloutCheck[]
  guidance: string
}

export type MergeizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingMergeizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateMergeizabilityRollout(
  input: MergeizabilityRolloutInput,
): MergeizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const mergeizabilityTableCoverageComplete =
    input.existingMergeizabilityTableCount === CRITICAL_MERGEIZABILITY_TABLES.length

  const checks: MergeizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL mergeizability checks can reach the database.'
            : 'Production mergeizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'mergeizability_signal_table_coverage',
      label: 'Mergeizability signal table coverage',
      status: mergeizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Mergeizability signal table coverage is only enforced in production.'
          : mergeizabilityTableCoverageComplete
            ? `${input.existingMergeizabilityTableCount}/${CRITICAL_MERGEIZABILITY_TABLES.length} mergeizability signal tables are present.`
            : `${input.existingMergeizabilityTableCount}/${CRITICAL_MERGEIZABILITY_TABLES.length} mergeizability signal tables were found.`,
    },
    {
      name: 'membership_mergeizability',
      label: 'Membership mergeizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership mergeizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership mergeizability signals.'
            : 'Production mergeizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_mergeizability',
      label: 'Usage event mergeizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event mergeizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event mergeizability signals.'
            : 'Production mergeizability rollout requires a usage_events table.',
    },
    {
      name: 'mergeization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          mergeizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              mergeizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support mergeization readiness.'
            : 'Production mergeizability rollout requires PostgreSQL connectivity, mergeizability tables, membership mergeizability, usage event mergeizability, and full signal coverage.',
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
        ? 'Production mergeizability rollout checks passed. Mergeizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production mergeizability rollout is not ready. Resolve failed checks before relying on production mergeizability tooling.',
  }
}

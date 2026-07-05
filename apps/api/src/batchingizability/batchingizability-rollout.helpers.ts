import type { ApiEnv } from '../config/env.js'

export const CRITICAL_BATCHINGIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type BatchingizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type BatchingizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: BatchingizabilityRolloutCheck[]
  guidance: string
}

export type BatchingizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingBatchingizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateBatchingizabilityRollout(
  input: BatchingizabilityRolloutInput,
): BatchingizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const batchingizabilityTableCoverageComplete =
    input.existingBatchingizabilityTableCount === CRITICAL_BATCHINGIZABILITY_TABLES.length

  const checks: BatchingizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL batchingizability checks can reach the database.'
            : 'Production batchingizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'batchingizability_signal_table_coverage',
      label: 'Batchingizability signal table coverage',
      status: batchingizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Batchingizability signal table coverage is only enforced in production.'
          : batchingizabilityTableCoverageComplete
            ? `${input.existingBatchingizabilityTableCount}/${CRITICAL_BATCHINGIZABILITY_TABLES.length} batchingizability signal tables are present.`
            : `${input.existingBatchingizabilityTableCount}/${CRITICAL_BATCHINGIZABILITY_TABLES.length} batchingizability signal tables were found.`,
    },
    {
      name: 'membership_batchingizability',
      label: 'Membership batchingizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership batchingizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership batchingizability signals.'
            : 'Production batchingizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_batchingizability',
      label: 'Usage event batchingizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event batchingizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event batchingizability signals.'
            : 'Production batchingizability rollout requires a usage_events table.',
    },
    {
      name: 'batchingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          batchingizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              batchingizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support batchingization readiness.'
            : 'Production batchingizability rollout requires PostgreSQL connectivity, batchingizability tables, membership batchingizability, usage event batchingizability, and full signal coverage.',
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
        ? 'Production batchingizability rollout checks passed. Batchingizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production batchingizability rollout is not ready. Resolve failed checks before relying on production batchingizability tooling.',
  }
}

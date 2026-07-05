import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PARTITIONINGIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type PartitioningizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type PartitioningizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: PartitioningizabilityRolloutCheck[]
  guidance: string
}

export type PartitioningizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingPartitioningizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluatePartitioningizabilityRollout(
  input: PartitioningizabilityRolloutInput,
): PartitioningizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const partitioningizabilityTableCoverageComplete =
    input.existingPartitioningizabilityTableCount === CRITICAL_PARTITIONINGIZABILITY_TABLES.length

  const checks: PartitioningizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL partitioningizability checks can reach the database.'
            : 'Production partitioningizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'partitioningizability_signal_table_coverage',
      label: 'Partitioningizability signal table coverage',
      status: partitioningizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Partitioningizability signal table coverage is only enforced in production.'
          : partitioningizabilityTableCoverageComplete
            ? `${input.existingPartitioningizabilityTableCount}/${CRITICAL_PARTITIONINGIZABILITY_TABLES.length} partitioningizability signal tables are present.`
            : `${input.existingPartitioningizabilityTableCount}/${CRITICAL_PARTITIONINGIZABILITY_TABLES.length} partitioningizability signal tables were found.`,
    },
    {
      name: 'membership_partitioningizability',
      label: 'Membership partitioningizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership partitioningizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership partitioningizability signals.'
            : 'Production partitioningizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_partitioningizability',
      label: 'Usage event partitioningizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event partitioningizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event partitioningizability signals.'
            : 'Production partitioningizability rollout requires a usage_events table.',
    },
    {
      name: 'partitioningization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          partitioningizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              partitioningizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support partitioningization readiness.'
            : 'Production partitioningizability rollout requires PostgreSQL connectivity, partitioningizability tables, membership partitioningizability, usage event partitioningizability, and full signal coverage.',
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
        ? 'Production partitioningizability rollout checks passed. Partitioningizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production partitioningizability rollout is not ready. Resolve failed checks before relying on production partitioningizability tooling.',
  }
}

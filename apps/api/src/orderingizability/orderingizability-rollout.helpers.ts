import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ORDERINGIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type OrderingizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type OrderingizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: OrderingizabilityRolloutCheck[]
  guidance: string
}

export type OrderingizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingOrderingizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateOrderingizabilityRollout(
  input: OrderingizabilityRolloutInput,
): OrderingizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const orderingizabilityTableCoverageComplete =
    input.existingOrderingizabilityTableCount === CRITICAL_ORDERINGIZABILITY_TABLES.length

  const checks: OrderingizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL orderingizability checks can reach the database.'
            : 'Production orderingizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'orderingizability_signal_table_coverage',
      label: 'Orderingizability signal table coverage',
      status: orderingizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Orderingizability signal table coverage is only enforced in production.'
          : orderingizabilityTableCoverageComplete
            ? `${input.existingOrderingizabilityTableCount}/${CRITICAL_ORDERINGIZABILITY_TABLES.length} orderingizability signal tables are present.`
            : `${input.existingOrderingizabilityTableCount}/${CRITICAL_ORDERINGIZABILITY_TABLES.length} orderingizability signal tables were found.`,
    },
    {
      name: 'membership_orderingizability',
      label: 'Membership orderingizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership orderingizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership orderingizability signals.'
            : 'Production orderingizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_orderingizability',
      label: 'Usage event orderingizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event orderingizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event orderingizability signals.'
            : 'Production orderingizability rollout requires a usage_events table.',
    },
    {
      name: 'orderingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          orderingizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              orderingizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support orderingization readiness.'
            : 'Production orderingizability rollout requires PostgreSQL connectivity, orderingizability tables, membership orderingizability, usage event orderingizability, and full signal coverage.',
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
        ? 'Production orderingizability rollout checks passed. Orderingizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production orderingizability rollout is not ready. Resolve failed checks before relying on production orderingizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_LINEAGEIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type LineageizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type LineageizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: LineageizabilityRolloutCheck[]
  guidance: string
}

export type LineageizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingLineageizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateLineageizabilityRollout(
  input: LineageizabilityRolloutInput,
): LineageizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const lineageizabilityTableCoverageComplete =
    input.existingLineageizabilityTableCount === CRITICAL_LINEAGEIZABILITY_TABLES.length

  const checks: LineageizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL lineageizability checks can reach the database.'
            : 'Production lineageizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'lineageizability_signal_table_coverage',
      label: 'Lineageizability signal table coverage',
      status: lineageizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Lineageizability signal table coverage is only enforced in production.'
          : lineageizabilityTableCoverageComplete
            ? `${input.existingLineageizabilityTableCount}/${CRITICAL_LINEAGEIZABILITY_TABLES.length} lineageizability signal tables are present.`
            : `${input.existingLineageizabilityTableCount}/${CRITICAL_LINEAGEIZABILITY_TABLES.length} lineageizability signal tables were found.`,
    },
    {
      name: 'membership_lineageizability',
      label: 'Membership lineageizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership lineageizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership lineageizability signals.'
            : 'Production lineageizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_lineageizability',
      label: 'Usage event lineageizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event lineageizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event lineageizability signals.'
            : 'Production lineageizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          lineageizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              lineageizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production lineageizability rollout requires PostgreSQL connectivity, lineageizability tables, membership lineageizability, usage event lineageizability, and full signal coverage.',
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
        ? 'Production lineageizability rollout checks passed. Lineageizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production lineageizability rollout is not ready. Resolve failed checks before relying on production lineageizability tooling.',
  }
}

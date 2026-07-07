import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TRACEPROOFIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type TraceproofizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TraceproofizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TraceproofizabilityRolloutCheck[]
  guidance: string
}

export type TraceproofizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTraceproofizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateTraceproofizabilityRollout(
  input: TraceproofizabilityRolloutInput,
): TraceproofizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const traceproofizabilityTableCoverageComplete =
    input.existingTraceproofizabilityTableCount === CRITICAL_TRACEPROOFIZABILITY_TABLES.length

  const checks: TraceproofizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL traceproofizability checks can reach the database.'
            : 'Production traceproofizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'traceproofizability_signal_table_coverage',
      label: 'Traceproofizability signal table coverage',
      status: traceproofizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Traceproofizability signal table coverage is only enforced in production.'
          : traceproofizabilityTableCoverageComplete
            ? `${input.existingTraceproofizabilityTableCount}/${CRITICAL_TRACEPROOFIZABILITY_TABLES.length} traceproofizability signal tables are present.`
            : `${input.existingTraceproofizabilityTableCount}/${CRITICAL_TRACEPROOFIZABILITY_TABLES.length} traceproofizability signal tables were found.`,
    },
    {
      name: 'membership_traceproofizability',
      label: 'Membership traceproofizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership traceproofizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership traceproofizability signals.'
            : 'Production traceproofizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_traceproofizability',
      label: 'Usage event traceproofizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event traceproofizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event traceproofizability signals.'
            : 'Production traceproofizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          traceproofizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              traceproofizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production traceproofizability rollout requires PostgreSQL connectivity, traceproofizability tables, membership traceproofizability, usage event traceproofizability, and full signal coverage.',
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
        ? 'Production traceproofizability rollout checks passed. Traceproofizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production traceproofizability rollout is not ready. Resolve failed checks before relying on production traceproofizability tooling.',
  }
}

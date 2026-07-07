import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TRACELEDGERIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type TraceledgerizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TraceledgerizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TraceledgerizabilityRolloutCheck[]
  guidance: string
}

export type TraceledgerizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTraceledgerizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateTraceledgerizabilityRollout(
  input: TraceledgerizabilityRolloutInput,
): TraceledgerizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const traceledgerizabilityTableCoverageComplete =
    input.existingTraceledgerizabilityTableCount === CRITICAL_TRACELEDGERIZABILITY_TABLES.length

  const checks: TraceledgerizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL traceledgerizability checks can reach the database.'
            : 'Production traceledgerizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'traceledgerizability_signal_table_coverage',
      label: 'Traceledgerizability signal table coverage',
      status: traceledgerizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Traceledgerizability signal table coverage is only enforced in production.'
          : traceledgerizabilityTableCoverageComplete
            ? `${input.existingTraceledgerizabilityTableCount}/${CRITICAL_TRACELEDGERIZABILITY_TABLES.length} traceledgerizability signal tables are present.`
            : `${input.existingTraceledgerizabilityTableCount}/${CRITICAL_TRACELEDGERIZABILITY_TABLES.length} traceledgerizability signal tables were found.`,
    },
    {
      name: 'membership_traceledgerizability',
      label: 'Membership traceledgerizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership traceledgerizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership traceledgerizability signals.'
            : 'Production traceledgerizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_traceledgerizability',
      label: 'Usage event traceledgerizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event traceledgerizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event traceledgerizability signals.'
            : 'Production traceledgerizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          traceledgerizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              traceledgerizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production traceledgerizability rollout requires PostgreSQL connectivity, traceledgerizability tables, membership traceledgerizability, usage event traceledgerizability, and full signal coverage.',
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
        ? 'Production traceledgerizability rollout checks passed. Traceledgerizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production traceledgerizability rollout is not ready. Resolve failed checks before relying on production traceledgerizability tooling.',
  }
}

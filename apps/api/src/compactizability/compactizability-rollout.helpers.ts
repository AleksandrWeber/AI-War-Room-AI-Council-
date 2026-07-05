import type { ApiEnv } from '../config/env.js'

export const CRITICAL_COMPACTIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type CompactizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CompactizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CompactizabilityRolloutCheck[]
  guidance: string
}

export type CompactizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCompactizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateCompactizabilityRollout(
  input: CompactizabilityRolloutInput,
): CompactizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const compactizabilityTableCoverageComplete =
    input.existingCompactizabilityTableCount === CRITICAL_COMPACTIZABILITY_TABLES.length

  const checks: CompactizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL compactizability checks can reach the database.'
            : 'Production compactizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'compactizability_signal_table_coverage',
      label: 'Compactizability signal table coverage',
      status: compactizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Compactizability signal table coverage is only enforced in production.'
          : compactizabilityTableCoverageComplete
            ? `${input.existingCompactizabilityTableCount}/${CRITICAL_COMPACTIZABILITY_TABLES.length} compactizability signal tables are present.`
            : `${input.existingCompactizabilityTableCount}/${CRITICAL_COMPACTIZABILITY_TABLES.length} compactizability signal tables were found.`,
    },
    {
      name: 'membership_compactizability',
      label: 'Membership compactizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership compactizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership compactizability signals.'
            : 'Production compactizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_compactizability',
      label: 'Usage event compactizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event compactizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event compactizability signals.'
            : 'Production compactizability rollout requires a usage_events table.',
    },
    {
      name: 'compactization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          compactizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              compactizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support compactization readiness.'
            : 'Production compactizability rollout requires PostgreSQL connectivity, compactizability tables, membership compactizability, usage event compactizability, and full signal coverage.',
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
        ? 'Production compactizability rollout checks passed. Compactizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production compactizability rollout is not ready. Resolve failed checks before relying on production compactizability tooling.',
  }
}

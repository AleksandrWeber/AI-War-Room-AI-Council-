import type { ApiEnv } from '../config/env.js'

export const CRITICAL_COMPRESSIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type CompressizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CompressizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CompressizabilityRolloutCheck[]
  guidance: string
}

export type CompressizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCompressizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateCompressizabilityRollout(
  input: CompressizabilityRolloutInput,
): CompressizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const compressizabilityTableCoverageComplete =
    input.existingCompressizabilityTableCount === CRITICAL_COMPRESSIZABILITY_TABLES.length

  const checks: CompressizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL compressizability checks can reach the database.'
            : 'Production compressizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'compressizability_signal_table_coverage',
      label: 'Compressizability signal table coverage',
      status: compressizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Compressizability signal table coverage is only enforced in production.'
          : compressizabilityTableCoverageComplete
            ? `${input.existingCompressizabilityTableCount}/${CRITICAL_COMPRESSIZABILITY_TABLES.length} compressizability signal tables are present.`
            : `${input.existingCompressizabilityTableCount}/${CRITICAL_COMPRESSIZABILITY_TABLES.length} compressizability signal tables were found.`,
    },
    {
      name: 'membership_compressizability',
      label: 'Membership compressizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership compressizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership compressizability signals.'
            : 'Production compressizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_compressizability',
      label: 'Usage event compressizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event compressizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event compressizability signals.'
            : 'Production compressizability rollout requires a usage_events table.',
    },
    {
      name: 'compressization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          compressizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              compressizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support compressization readiness.'
            : 'Production compressizability rollout requires PostgreSQL connectivity, compressizability tables, membership compressizability, usage event compressizability, and full signal coverage.',
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
        ? 'Production compressizability rollout checks passed. Compressizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production compressizability rollout is not ready. Resolve failed checks before relying on production compressizability tooling.',
  }
}

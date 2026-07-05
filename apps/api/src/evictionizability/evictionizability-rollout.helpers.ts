import type { ApiEnv } from '../config/env.js'

export const CRITICAL_EVICTIONIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type EvictionizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type EvictionizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: EvictionizabilityRolloutCheck[]
  guidance: string
}

export type EvictionizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingEvictionizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateEvictionizabilityRollout(
  input: EvictionizabilityRolloutInput,
): EvictionizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const evictionizabilityTableCoverageComplete =
    input.existingEvictionizabilityTableCount === CRITICAL_EVICTIONIZABILITY_TABLES.length

  const checks: EvictionizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL evictionizability checks can reach the database.'
            : 'Production evictionizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'evictionizability_signal_table_coverage',
      label: 'Evictionizability signal table coverage',
      status: evictionizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Evictionizability signal table coverage is only enforced in production.'
          : evictionizabilityTableCoverageComplete
            ? `${input.existingEvictionizabilityTableCount}/${CRITICAL_EVICTIONIZABILITY_TABLES.length} evictionizability signal tables are present.`
            : `${input.existingEvictionizabilityTableCount}/${CRITICAL_EVICTIONIZABILITY_TABLES.length} evictionizability signal tables were found.`,
    },
    {
      name: 'membership_evictionizability',
      label: 'Membership evictionizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership evictionizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership evictionizability signals.'
            : 'Production evictionizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_evictionizability',
      label: 'Usage event evictionizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event evictionizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event evictionizability signals.'
            : 'Production evictionizability rollout requires a usage_events table.',
    },
    {
      name: 'evictionization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          evictionizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              evictionizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support evictionization readiness.'
            : 'Production evictionizability rollout requires PostgreSQL connectivity, evictionizability tables, membership evictionizability, usage event evictionizability, and full signal coverage.',
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
        ? 'Production evictionizability rollout checks passed. Evictionizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production evictionizability rollout is not ready. Resolve failed checks before relying on production evictionizability tooling.',
  }
}

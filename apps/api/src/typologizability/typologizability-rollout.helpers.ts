import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TYPOLOGIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type TypologizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TypologizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TypologizabilityRolloutCheck[]
  guidance: string
}

export type TypologizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTypologizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateTypologizabilityRollout(
  input: TypologizabilityRolloutInput,
): TypologizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const typologizabilityTableCoverageComplete =
    input.existingTypologizabilityTableCount === CRITICAL_TYPOLOGIZABILITY_TABLES.length

  const checks: TypologizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL typologizability checks can reach the database.'
            : 'Production typologizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'typologizability_signal_table_coverage',
      label: 'Typologizability signal table coverage',
      status: typologizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Typologizability signal table coverage is only enforced in production.'
          : typologizabilityTableCoverageComplete
            ? `${input.existingTypologizabilityTableCount}/${CRITICAL_TYPOLOGIZABILITY_TABLES.length} typologizability signal tables are present.`
            : `${input.existingTypologizabilityTableCount}/${CRITICAL_TYPOLOGIZABILITY_TABLES.length} typologizability signal tables were found.`,
    },
    {
      name: 'membership_typologizability',
      label: 'Membership typologizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership typologizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership typologizability signals.'
            : 'Production typologizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_typologizability',
      label: 'Usage event typologizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event typologizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event typologizability signals.'
            : 'Production typologizability rollout requires a usage_events table.',
    },
    {
      name: 'typologization_readiness_signal',
      label: 'Typologization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          typologizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Typologization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              typologizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support typologization readiness.'
            : 'Production typologizability rollout requires PostgreSQL connectivity, typologizability tables, membership typologizability, usage event typologizability, and full signal coverage.',
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
        ? 'Production typologizability rollout checks passed. Typologizability coverage and typologization readiness signal signals are healthy.'
        : 'Production typologizability rollout is not ready. Resolve failed checks before relying on production typologizability tooling.',
  }
}

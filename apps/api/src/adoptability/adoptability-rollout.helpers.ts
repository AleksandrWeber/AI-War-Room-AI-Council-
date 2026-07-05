import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ADOPTABILITY_TABLES = [
  'usage_events',
  'workspace_memberships',
  'billing_notifications',
] as const

export type AdoptabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AdoptabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AdoptabilityRolloutCheck[]
  guidance: string
}

export type AdoptabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAdoptabilityTableCount: number
  usageEventsTableExists: boolean
  workspaceMembershipsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateAdoptabilityRollout(
  input: AdoptabilityRolloutInput,
): AdoptabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const adoptabilityTableCoverageComplete =
    input.existingAdoptabilityTableCount === CRITICAL_ADOPTABILITY_TABLES.length

  const checks: AdoptabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL adoptability checks can reach the database.'
            : 'Production adoptability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'adoptability_signal_table_coverage',
      label: 'Adoptability signal table coverage',
      status: adoptabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Adoptability signal table coverage is only enforced in production.'
          : adoptabilityTableCoverageComplete
            ? `${input.existingAdoptabilityTableCount}/${CRITICAL_ADOPTABILITY_TABLES.length} adoptability signal tables are present.`
            : `${input.existingAdoptabilityTableCount}/${CRITICAL_ADOPTABILITY_TABLES.length} adoptability signal tables were found.`,
    },
    {
      name: 'usage_event_adoptability',
      label: 'Usage event adoptability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event adoptability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event adoptability signals.'
            : 'Production adoptability rollout requires a usage_events table.',
    },
    {
      name: 'membership_adoptability',
      label: 'Membership adoptability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership adoptability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership adoptability signals.'
            : 'Production adoptability rollout requires a workspace_memberships table.',
    },
    {
      name: 'adoption_readiness_signal',
      label: 'Adoption readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          adoptabilityTableCoverageComplete &&
          input.usageEventsTableExists &&
          input.workspaceMembershipsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Adoption readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              adoptabilityTableCoverageComplete &&
              input.usageEventsTableExists &&
              input.workspaceMembershipsTableExists &&
              input.billingNotificationsTableExists
            ? 'Usage events, workspace memberships, and billing notifications support adoption readiness.'
            : 'Production adoptability rollout requires PostgreSQL connectivity, adoptability tables, usage event adoptability, membership adoptability, and full signal coverage.',
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
        ? 'Production adoptability rollout checks passed. Adoptability coverage and adoption readiness signal signals are healthy.'
        : 'Production adoptability rollout is not ready. Resolve failed checks before relying on production adoptability tooling.',
  }
}

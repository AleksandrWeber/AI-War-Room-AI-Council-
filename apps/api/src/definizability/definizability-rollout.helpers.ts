import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DEFINIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type DefinizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DefinizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DefinizabilityRolloutCheck[]
  guidance: string
}

export type DefinizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDefinizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateDefinizabilityRollout(
  input: DefinizabilityRolloutInput,
): DefinizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const definizabilityTableCoverageComplete =
    input.existingDefinizabilityTableCount === CRITICAL_DEFINIZABILITY_TABLES.length

  const checks: DefinizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL definizability checks can reach the database.'
            : 'Production definizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'definizability_signal_table_coverage',
      label: 'Definizability signal table coverage',
      status: definizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Definizability signal table coverage is only enforced in production.'
          : definizabilityTableCoverageComplete
            ? `${input.existingDefinizabilityTableCount}/${CRITICAL_DEFINIZABILITY_TABLES.length} definizability signal tables are present.`
            : `${input.existingDefinizabilityTableCount}/${CRITICAL_DEFINIZABILITY_TABLES.length} definizability signal tables were found.`,
    },
    {
      name: 'membership_definizability',
      label: 'Membership definizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership definizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership definizability signals.'
            : 'Production definizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_definizability',
      label: 'Usage event definizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event definizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event definizability signals.'
            : 'Production definizability rollout requires a usage_events table.',
    },
    {
      name: 'definization_readiness_signal',
      label: 'Definization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          definizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Definization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              definizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support definization readiness.'
            : 'Production definizability rollout requires PostgreSQL connectivity, definizability tables, membership definizability, usage event definizability, and full signal coverage.',
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
        ? 'Production definizability rollout checks passed. Definizability coverage and definization readiness signal signals are healthy.'
        : 'Production definizability rollout is not ready. Resolve failed checks before relying on production definizability tooling.',
  }
}

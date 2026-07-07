import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ACCREDITATIONIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type AccreditationizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AccreditationizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AccreditationizabilityRolloutCheck[]
  guidance: string
}

export type AccreditationizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAccreditationizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateAccreditationizabilityRollout(
  input: AccreditationizabilityRolloutInput,
): AccreditationizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const accreditationizabilityTableCoverageComplete =
    input.existingAccreditationizabilityTableCount === CRITICAL_ACCREDITATIONIZABILITY_TABLES.length

  const checks: AccreditationizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL accreditationizability checks can reach the database.'
            : 'Production accreditationizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'accreditationizability_signal_table_coverage',
      label: 'Accreditationizability signal table coverage',
      status: accreditationizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Accreditationizability signal table coverage is only enforced in production.'
          : accreditationizabilityTableCoverageComplete
            ? `${input.existingAccreditationizabilityTableCount}/${CRITICAL_ACCREDITATIONIZABILITY_TABLES.length} accreditationizability signal tables are present.`
            : `${input.existingAccreditationizabilityTableCount}/${CRITICAL_ACCREDITATIONIZABILITY_TABLES.length} accreditationizability signal tables were found.`,
    },
    {
      name: 'membership_accreditationizability',
      label: 'Membership accreditationizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership accreditationizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership accreditationizability signals.'
            : 'Production accreditationizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_accreditationizability',
      label: 'Usage event accreditationizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event accreditationizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event accreditationizability signals.'
            : 'Production accreditationizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          accreditationizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              accreditationizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production accreditationizability rollout requires PostgreSQL connectivity, accreditationizability tables, membership accreditationizability, usage event accreditationizability, and full signal coverage.',
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
        ? 'Production accreditationizability rollout checks passed. Accreditationizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production accreditationizability rollout is not ready. Resolve failed checks before relying on production accreditationizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_RESPONSIVENESSVAULTIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type ResponsivenessvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ResponsivenessvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ResponsivenessvaultizabilityRolloutCheck[]
  guidance: string
}

export type ResponsivenessvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingResponsivenessvaultizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateResponsivenessvaultizabilityRollout(
  input: ResponsivenessvaultizabilityRolloutInput,
): ResponsivenessvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const responsivenessvaultizabilityTableCoverageComplete =
    input.existingResponsivenessvaultizabilityTableCount === CRITICAL_RESPONSIVENESSVAULTIZABILITY_TABLES.length

  const checks: ResponsivenessvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL responsivenessvaultizability checks can reach the database.'
            : 'Production responsivenessvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'responsivenessvaultizability_signal_table_coverage',
      label: 'Responsivenessvaultizability signal table coverage',
      status: responsivenessvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Responsivenessvaultizability signal table coverage is only enforced in production.'
          : responsivenessvaultizabilityTableCoverageComplete
            ? `${input.existingResponsivenessvaultizabilityTableCount}/${CRITICAL_RESPONSIVENESSVAULTIZABILITY_TABLES.length} responsivenessvaultizability signal tables are present.`
            : `${input.existingResponsivenessvaultizabilityTableCount}/${CRITICAL_RESPONSIVENESSVAULTIZABILITY_TABLES.length} responsivenessvaultizability signal tables were found.`,
    },
    {
      name: 'membership_responsivenessvaultizability',
      label: 'Membership responsivenessvaultizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership responsivenessvaultizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership responsivenessvaultizability signals.'
            : 'Production responsivenessvaultizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_responsivenessvaultizability',
      label: 'Usage event responsivenessvaultizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event responsivenessvaultizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event responsivenessvaultizability signals.'
            : 'Production responsivenessvaultizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          responsivenessvaultizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              responsivenessvaultizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production responsivenessvaultizability rollout requires PostgreSQL connectivity, responsivenessvaultizability tables, membership responsivenessvaultizability, usage event responsivenessvaultizability, and full signal coverage.',
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
        ? 'Production responsivenessvaultizability rollout checks passed. Responsivenessvaultizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production responsivenessvaultizability rollout is not ready. Resolve failed checks before relying on production responsivenessvaultizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SECURITYIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type SecurityizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SecurityizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SecurityizabilityRolloutCheck[]
  guidance: string
}

export type SecurityizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSecurityizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateSecurityizabilityRollout(
  input: SecurityizabilityRolloutInput,
): SecurityizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const securityizabilityTableCoverageComplete =
    input.existingSecurityizabilityTableCount === CRITICAL_SECURITYIZABILITY_TABLES.length

  const checks: SecurityizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL securityizability checks can reach the database.'
            : 'Production securityizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'securityizability_signal_table_coverage',
      label: 'Securityizability signal table coverage',
      status: securityizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Securityizability signal table coverage is only enforced in production.'
          : securityizabilityTableCoverageComplete
            ? `${input.existingSecurityizabilityTableCount}/${CRITICAL_SECURITYIZABILITY_TABLES.length} securityizability signal tables are present.`
            : `${input.existingSecurityizabilityTableCount}/${CRITICAL_SECURITYIZABILITY_TABLES.length} securityizability signal tables were found.`,
    },
    {
      name: 'membership_securityizability',
      label: 'Membership securityizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership securityizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership securityizability signals.'
            : 'Production securityizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_securityizability',
      label: 'Usage event securityizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event securityizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event securityizability signals.'
            : 'Production securityizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          securityizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              securityizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production securityizability rollout requires PostgreSQL connectivity, securityizability tables, membership securityizability, usage event securityizability, and full signal coverage.',
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
        ? 'Production securityizability rollout checks passed. Securityizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production securityizability rollout is not ready. Resolve failed checks before relying on production securityizability tooling.',
  }
}

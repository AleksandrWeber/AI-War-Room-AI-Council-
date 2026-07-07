import type { ApiEnv } from '../config/env.js'

export const CRITICAL_NONREPUDIATIONIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type NonrepudiationizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type NonrepudiationizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: NonrepudiationizabilityRolloutCheck[]
  guidance: string
}

export type NonrepudiationizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingNonrepudiationizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateNonrepudiationizabilityRollout(
  input: NonrepudiationizabilityRolloutInput,
): NonrepudiationizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const nonrepudiationizabilityTableCoverageComplete =
    input.existingNonrepudiationizabilityTableCount === CRITICAL_NONREPUDIATIONIZABILITY_TABLES.length

  const checks: NonrepudiationizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL nonrepudiationizability checks can reach the database.'
            : 'Production nonrepudiationizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'nonrepudiationizability_signal_table_coverage',
      label: 'Nonrepudiationizability signal table coverage',
      status: nonrepudiationizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Nonrepudiationizability signal table coverage is only enforced in production.'
          : nonrepudiationizabilityTableCoverageComplete
            ? `${input.existingNonrepudiationizabilityTableCount}/${CRITICAL_NONREPUDIATIONIZABILITY_TABLES.length} nonrepudiationizability signal tables are present.`
            : `${input.existingNonrepudiationizabilityTableCount}/${CRITICAL_NONREPUDIATIONIZABILITY_TABLES.length} nonrepudiationizability signal tables were found.`,
    },
    {
      name: 'membership_nonrepudiationizability',
      label: 'Membership nonrepudiationizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership nonrepudiationizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership nonrepudiationizability signals.'
            : 'Production nonrepudiationizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_nonrepudiationizability',
      label: 'Usage event nonrepudiationizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event nonrepudiationizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event nonrepudiationizability signals.'
            : 'Production nonrepudiationizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          nonrepudiationizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              nonrepudiationizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production nonrepudiationizability rollout requires PostgreSQL connectivity, nonrepudiationizability tables, membership nonrepudiationizability, usage event nonrepudiationizability, and full signal coverage.',
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
        ? 'Production nonrepudiationizability rollout checks passed. Nonrepudiationizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production nonrepudiationizability rollout is not ready. Resolve failed checks before relying on production nonrepudiationizability tooling.',
  }
}

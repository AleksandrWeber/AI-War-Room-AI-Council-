import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TERMINOLOGIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type TerminologizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TerminologizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TerminologizabilityRolloutCheck[]
  guidance: string
}

export type TerminologizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTerminologizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateTerminologizabilityRollout(
  input: TerminologizabilityRolloutInput,
): TerminologizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const terminologizabilityTableCoverageComplete =
    input.existingTerminologizabilityTableCount === CRITICAL_TERMINOLOGIZABILITY_TABLES.length

  const checks: TerminologizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL terminologizability checks can reach the database.'
            : 'Production terminologizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'terminologizability_signal_table_coverage',
      label: 'Terminologizability signal table coverage',
      status: terminologizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Terminologizability signal table coverage is only enforced in production.'
          : terminologizabilityTableCoverageComplete
            ? `${input.existingTerminologizabilityTableCount}/${CRITICAL_TERMINOLOGIZABILITY_TABLES.length} terminologizability signal tables are present.`
            : `${input.existingTerminologizabilityTableCount}/${CRITICAL_TERMINOLOGIZABILITY_TABLES.length} terminologizability signal tables were found.`,
    },
    {
      name: 'membership_terminologizability',
      label: 'Membership terminologizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership terminologizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership terminologizability signals.'
            : 'Production terminologizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_terminologizability',
      label: 'Usage event terminologizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event terminologizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event terminologizability signals.'
            : 'Production terminologizability rollout requires a usage_events table.',
    },
    {
      name: 'terminologization_readiness_signal',
      label: 'Terminologization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          terminologizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Terminologization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              terminologizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support terminologization readiness.'
            : 'Production terminologizability rollout requires PostgreSQL connectivity, terminologizability tables, membership terminologizability, usage event terminologizability, and full signal coverage.',
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
        ? 'Production terminologizability rollout checks passed. Terminologizability coverage and terminologization readiness signal signals are healthy.'
        : 'Production terminologizability rollout is not ready. Resolve failed checks before relying on production terminologizability tooling.',
  }
}

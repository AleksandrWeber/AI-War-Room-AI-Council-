import type { ApiEnv } from '../config/env.js'

export const CRITICAL_LOCATABILITYVAULTIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type LocatabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type LocatabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: LocatabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type LocatabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingLocatabilityvaultizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateLocatabilityvaultizabilityRollout(
  input: LocatabilityvaultizabilityRolloutInput,
): LocatabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const locatabilityvaultizabilityTableCoverageComplete =
    input.existingLocatabilityvaultizabilityTableCount === CRITICAL_LOCATABILITYVAULTIZABILITY_TABLES.length

  const checks: LocatabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL locatabilityvaultizability checks can reach the database.'
            : 'Production locatabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'locatabilityvaultizability_signal_table_coverage',
      label: 'Locatabilityvaultizability signal table coverage',
      status: locatabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Locatabilityvaultizability signal table coverage is only enforced in production.'
          : locatabilityvaultizabilityTableCoverageComplete
            ? `${input.existingLocatabilityvaultizabilityTableCount}/${CRITICAL_LOCATABILITYVAULTIZABILITY_TABLES.length} locatabilityvaultizability signal tables are present.`
            : `${input.existingLocatabilityvaultizabilityTableCount}/${CRITICAL_LOCATABILITYVAULTIZABILITY_TABLES.length} locatabilityvaultizability signal tables were found.`,
    },
    {
      name: 'membership_locatabilityvaultizability',
      label: 'Membership locatabilityvaultizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership locatabilityvaultizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership locatabilityvaultizability signals.'
            : 'Production locatabilityvaultizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_locatabilityvaultizability',
      label: 'Usage event locatabilityvaultizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event locatabilityvaultizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event locatabilityvaultizability signals.'
            : 'Production locatabilityvaultizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          locatabilityvaultizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              locatabilityvaultizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production locatabilityvaultizability rollout requires PostgreSQL connectivity, locatabilityvaultizability tables, membership locatabilityvaultizability, usage event locatabilityvaultizability, and full signal coverage.',
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
        ? 'Production locatabilityvaultizability rollout checks passed. Locatabilityvaultizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production locatabilityvaultizability rollout is not ready. Resolve failed checks before relying on production locatabilityvaultizability tooling.',
  }
}

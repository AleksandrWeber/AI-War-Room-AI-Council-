import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SCHEDULABILITYVAULTIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type SchedulabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SchedulabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SchedulabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type SchedulabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSchedulabilityvaultizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateSchedulabilityvaultizabilityRollout(
  input: SchedulabilityvaultizabilityRolloutInput,
): SchedulabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const schedulabilityvaultizabilityTableCoverageComplete =
    input.existingSchedulabilityvaultizabilityTableCount === CRITICAL_SCHEDULABILITYVAULTIZABILITY_TABLES.length

  const checks: SchedulabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL schedulabilityvaultizability checks can reach the database.'
            : 'Production schedulabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'schedulabilityvaultizability_signal_table_coverage',
      label: 'Schedulabilityvaultizability signal table coverage',
      status: schedulabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Schedulabilityvaultizability signal table coverage is only enforced in production.'
          : schedulabilityvaultizabilityTableCoverageComplete
            ? `${input.existingSchedulabilityvaultizabilityTableCount}/${CRITICAL_SCHEDULABILITYVAULTIZABILITY_TABLES.length} schedulabilityvaultizability signal tables are present.`
            : `${input.existingSchedulabilityvaultizabilityTableCount}/${CRITICAL_SCHEDULABILITYVAULTIZABILITY_TABLES.length} schedulabilityvaultizability signal tables were found.`,
    },
    {
      name: 'membership_schedulabilityvaultizability',
      label: 'Membership schedulabilityvaultizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership schedulabilityvaultizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership schedulabilityvaultizability signals.'
            : 'Production schedulabilityvaultizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_schedulabilityvaultizability',
      label: 'Usage event schedulabilityvaultizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event schedulabilityvaultizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event schedulabilityvaultizability signals.'
            : 'Production schedulabilityvaultizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          schedulabilityvaultizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              schedulabilityvaultizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production schedulabilityvaultizability rollout requires PostgreSQL connectivity, schedulabilityvaultizability tables, membership schedulabilityvaultizability, usage event schedulabilityvaultizability, and full signal coverage.',
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
        ? 'Production schedulabilityvaultizability rollout checks passed. Schedulabilityvaultizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production schedulabilityvaultizability rollout is not ready. Resolve failed checks before relying on production schedulabilityvaultizability tooling.',
  }
}

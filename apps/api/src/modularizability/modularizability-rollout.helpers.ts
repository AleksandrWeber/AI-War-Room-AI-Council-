import type { ApiEnv } from '../config/env.js'

export const CRITICAL_MODULARIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type ModularizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ModularizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ModularizabilityRolloutCheck[]
  guidance: string
}

export type ModularizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingModularizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateModularizabilityRollout(
  input: ModularizabilityRolloutInput,
): ModularizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const modularizabilityTableCoverageComplete =
    input.existingModularizabilityTableCount === CRITICAL_MODULARIZABILITY_TABLES.length

  const checks: ModularizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL modularizability checks can reach the database.'
            : 'Production modularizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'modularizability_signal_table_coverage',
      label: 'Modularizability signal table coverage',
      status: modularizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Modularizability signal table coverage is only enforced in production.'
          : modularizabilityTableCoverageComplete
            ? `${input.existingModularizabilityTableCount}/${CRITICAL_MODULARIZABILITY_TABLES.length} modularizability signal tables are present.`
            : `${input.existingModularizabilityTableCount}/${CRITICAL_MODULARIZABILITY_TABLES.length} modularizability signal tables were found.`,
    },
    {
      name: 'membership_modularizability',
      label: 'Membership modularizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership modularizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership modularizability signals.'
            : 'Production modularizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_modularizability',
      label: 'Usage event modularizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event modularizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event modularizability signals.'
            : 'Production modularizability rollout requires a usage_events table.',
    },
    {
      name: 'modularization_readiness_signal',
      label: 'Modularization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          modularizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Modularization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              modularizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support modularization readiness.'
            : 'Production modularizability rollout requires PostgreSQL connectivity, modularizability tables, membership modularizability, usage event modularizability, and full signal coverage.',
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
        ? 'Production modularizability rollout checks passed. Modularizability coverage and modularization readiness signal signals are healthy.'
        : 'Production modularizability rollout is not ready. Resolve failed checks before relying on production modularizability tooling.',
  }
}

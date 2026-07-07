import type { ApiEnv } from '../config/env.js'

export const CRITICAL_HEALINGIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type HealingizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type HealingizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: HealingizabilityRolloutCheck[]
  guidance: string
}

export type HealingizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingHealingizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateHealingizabilityRollout(
  input: HealingizabilityRolloutInput,
): HealingizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const healingizabilityTableCoverageComplete =
    input.existingHealingizabilityTableCount === CRITICAL_HEALINGIZABILITY_TABLES.length

  const checks: HealingizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL healingizability checks can reach the database.'
            : 'Production healingizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'healingizability_signal_table_coverage',
      label: 'Healingizability signal table coverage',
      status: healingizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Healingizability signal table coverage is only enforced in production.'
          : healingizabilityTableCoverageComplete
            ? `${input.existingHealingizabilityTableCount}/${CRITICAL_HEALINGIZABILITY_TABLES.length} healingizability signal tables are present.`
            : `${input.existingHealingizabilityTableCount}/${CRITICAL_HEALINGIZABILITY_TABLES.length} healingizability signal tables were found.`,
    },
    {
      name: 'membership_healingizability',
      label: 'Membership healingizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership healingizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership healingizability signals.'
            : 'Production healingizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_healingizability',
      label: 'Usage event healingizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event healingizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event healingizability signals.'
            : 'Production healingizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          healingizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              healingizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production healingizability rollout requires PostgreSQL connectivity, healingizability tables, membership healingizability, usage event healingizability, and full signal coverage.',
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
        ? 'Production healingizability rollout checks passed. Healingizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production healingizability rollout is not ready. Resolve failed checks before relying on production healingizability tooling.',
  }
}

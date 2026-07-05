import type { ApiEnv } from '../config/env.js'

export const CRITICAL_NARRATABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type NarratabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type NarratabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: NarratabilityRolloutCheck[]
  guidance: string
}

export type NarratabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingNarratabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateNarratabilityRollout(
  input: NarratabilityRolloutInput,
): NarratabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const narratabilityTableCoverageComplete =
    input.existingNarratabilityTableCount === CRITICAL_NARRATABILITY_TABLES.length

  const checks: NarratabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL narratability checks can reach the database.'
            : 'Production narratability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'narratability_signal_table_coverage',
      label: 'Narratability signal table coverage',
      status: narratabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Narratability signal table coverage is only enforced in production.'
          : narratabilityTableCoverageComplete
            ? `${input.existingNarratabilityTableCount}/${CRITICAL_NARRATABILITY_TABLES.length} narratability signal tables are present.`
            : `${input.existingNarratabilityTableCount}/${CRITICAL_NARRATABILITY_TABLES.length} narratability signal tables were found.`,
    },
    {
      name: 'membership_narratability',
      label: 'Membership narratability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership narratability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership narratability signals.'
            : 'Production narratability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_narratability',
      label: 'Usage event narratability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event narratability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event narratability signals.'
            : 'Production narratability rollout requires a usage_events table.',
    },
    {
      name: 'narration_readiness_signal',
      label: 'Narration readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          narratabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Narration readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              narratabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support narration readiness.'
            : 'Production narratability rollout requires PostgreSQL connectivity, narratability tables, membership narratability, usage event narratability, and full signal coverage.',
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
        ? 'Production narratability rollout checks passed. Narratability coverage and narration readiness signal signals are healthy.'
        : 'Production narratability rollout is not ready. Resolve failed checks before relying on production narratability tooling.',
  }
}

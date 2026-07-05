import type { ApiEnv } from '../config/env.js'

export const CRITICAL_RESILIENTIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type ResilientizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ResilientizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ResilientizabilityRolloutCheck[]
  guidance: string
}

export type ResilientizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingResilientizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateResilientizabilityRollout(
  input: ResilientizabilityRolloutInput,
): ResilientizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const resilientizabilityTableCoverageComplete =
    input.existingResilientizabilityTableCount === CRITICAL_RESILIENTIZABILITY_TABLES.length

  const checks: ResilientizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL resilientizability checks can reach the database.'
            : 'Production resilientizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'resilientizability_signal_table_coverage',
      label: 'Resilientizability signal table coverage',
      status: resilientizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Resilientizability signal table coverage is only enforced in production.'
          : resilientizabilityTableCoverageComplete
            ? `${input.existingResilientizabilityTableCount}/${CRITICAL_RESILIENTIZABILITY_TABLES.length} resilientizability signal tables are present.`
            : `${input.existingResilientizabilityTableCount}/${CRITICAL_RESILIENTIZABILITY_TABLES.length} resilientizability signal tables were found.`,
    },
    {
      name: 'membership_resilientizability',
      label: 'Membership resilientizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership resilientizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership resilientizability signals.'
            : 'Production resilientizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_resilientizability',
      label: 'Usage event resilientizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event resilientizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event resilientizability signals.'
            : 'Production resilientizability rollout requires a usage_events table.',
    },
    {
      name: 'resilientization_readiness_signal',
      label: 'Resilientization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          resilientizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Resilientization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              resilientizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support resilientization readiness.'
            : 'Production resilientizability rollout requires PostgreSQL connectivity, resilientizability tables, membership resilientizability, usage event resilientizability, and full signal coverage.',
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
        ? 'Production resilientizability rollout checks passed. Resilientizability coverage and resilientization readiness signal signals are healthy.'
        : 'Production resilientizability rollout is not ready. Resolve failed checks before relying on production resilientizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ORCHESTRIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type OrchestrizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type OrchestrizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: OrchestrizabilityRolloutCheck[]
  guidance: string
}

export type OrchestrizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingOrchestrizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateOrchestrizabilityRollout(
  input: OrchestrizabilityRolloutInput,
): OrchestrizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const orchestrizabilityTableCoverageComplete =
    input.existingOrchestrizabilityTableCount === CRITICAL_ORCHESTRIZABILITY_TABLES.length

  const checks: OrchestrizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL orchestrizability checks can reach the database.'
            : 'Production orchestrizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'orchestrizability_signal_table_coverage',
      label: 'Orchestrizability signal table coverage',
      status: orchestrizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Orchestrizability signal table coverage is only enforced in production.'
          : orchestrizabilityTableCoverageComplete
            ? `${input.existingOrchestrizabilityTableCount}/${CRITICAL_ORCHESTRIZABILITY_TABLES.length} orchestrizability signal tables are present.`
            : `${input.existingOrchestrizabilityTableCount}/${CRITICAL_ORCHESTRIZABILITY_TABLES.length} orchestrizability signal tables were found.`,
    },
    {
      name: 'membership_orchestrizability',
      label: 'Membership orchestrizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership orchestrizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership orchestrizability signals.'
            : 'Production orchestrizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_orchestrizability',
      label: 'Usage event orchestrizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event orchestrizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event orchestrizability signals.'
            : 'Production orchestrizability rollout requires a usage_events table.',
    },
    {
      name: 'orchestrization_readiness_signal',
      label: 'Orchestrization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          orchestrizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Orchestrization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              orchestrizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support orchestrization readiness.'
            : 'Production orchestrizability rollout requires PostgreSQL connectivity, orchestrizability tables, membership orchestrizability, usage event orchestrizability, and full signal coverage.',
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
        ? 'Production orchestrizability rollout checks passed. Orchestrizability coverage and orchestrization readiness signal signals are healthy.'
        : 'Production orchestrizability rollout is not ready. Resolve failed checks before relying on production orchestrizability tooling.',
  }
}

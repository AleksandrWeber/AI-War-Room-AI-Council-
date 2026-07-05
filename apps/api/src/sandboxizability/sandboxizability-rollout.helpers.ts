import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SANDBOXIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type SandboxizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SandboxizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SandboxizabilityRolloutCheck[]
  guidance: string
}

export type SandboxizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSandboxizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateSandboxizabilityRollout(
  input: SandboxizabilityRolloutInput,
): SandboxizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const sandboxizabilityTableCoverageComplete =
    input.existingSandboxizabilityTableCount === CRITICAL_SANDBOXIZABILITY_TABLES.length

  const checks: SandboxizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL sandboxizability checks can reach the database.'
            : 'Production sandboxizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'sandboxizability_signal_table_coverage',
      label: 'Sandboxizability signal table coverage',
      status: sandboxizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Sandboxizability signal table coverage is only enforced in production.'
          : sandboxizabilityTableCoverageComplete
            ? `${input.existingSandboxizabilityTableCount}/${CRITICAL_SANDBOXIZABILITY_TABLES.length} sandboxizability signal tables are present.`
            : `${input.existingSandboxizabilityTableCount}/${CRITICAL_SANDBOXIZABILITY_TABLES.length} sandboxizability signal tables were found.`,
    },
    {
      name: 'membership_sandboxizability',
      label: 'Membership sandboxizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership sandboxizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership sandboxizability signals.'
            : 'Production sandboxizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_sandboxizability',
      label: 'Usage event sandboxizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event sandboxizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event sandboxizability signals.'
            : 'Production sandboxizability rollout requires a usage_events table.',
    },
    {
      name: 'sandboxization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          sandboxizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              sandboxizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support sandboxization readiness.'
            : 'Production sandboxizability rollout requires PostgreSQL connectivity, sandboxizability tables, membership sandboxizability, usage event sandboxizability, and full signal coverage.',
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
        ? 'Production sandboxizability rollout checks passed. Sandboxizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production sandboxizability rollout is not ready. Resolve failed checks before relying on production sandboxizability tooling.',
  }
}

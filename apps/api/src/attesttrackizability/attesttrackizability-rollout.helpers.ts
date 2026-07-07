import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ATTESTTRACKIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type AttesttrackizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AttesttrackizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AttesttrackizabilityRolloutCheck[]
  guidance: string
}

export type AttesttrackizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAttesttrackizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateAttesttrackizabilityRollout(
  input: AttesttrackizabilityRolloutInput,
): AttesttrackizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const attesttrackizabilityTableCoverageComplete =
    input.existingAttesttrackizabilityTableCount === CRITICAL_ATTESTTRACKIZABILITY_TABLES.length

  const checks: AttesttrackizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL attesttrackizability checks can reach the database.'
            : 'Production attesttrackizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'attesttrackizability_signal_table_coverage',
      label: 'Attesttrackizability signal table coverage',
      status: attesttrackizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Attesttrackizability signal table coverage is only enforced in production.'
          : attesttrackizabilityTableCoverageComplete
            ? `${input.existingAttesttrackizabilityTableCount}/${CRITICAL_ATTESTTRACKIZABILITY_TABLES.length} attesttrackizability signal tables are present.`
            : `${input.existingAttesttrackizabilityTableCount}/${CRITICAL_ATTESTTRACKIZABILITY_TABLES.length} attesttrackizability signal tables were found.`,
    },
    {
      name: 'membership_attesttrackizability',
      label: 'Membership attesttrackizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership attesttrackizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership attesttrackizability signals.'
            : 'Production attesttrackizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_attesttrackizability',
      label: 'Usage event attesttrackizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event attesttrackizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event attesttrackizability signals.'
            : 'Production attesttrackizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          attesttrackizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              attesttrackizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production attesttrackizability rollout requires PostgreSQL connectivity, attesttrackizability tables, membership attesttrackizability, usage event attesttrackizability, and full signal coverage.',
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
        ? 'Production attesttrackizability rollout checks passed. Attesttrackizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production attesttrackizability rollout is not ready. Resolve failed checks before relying on production attesttrackizability tooling.',
  }
}

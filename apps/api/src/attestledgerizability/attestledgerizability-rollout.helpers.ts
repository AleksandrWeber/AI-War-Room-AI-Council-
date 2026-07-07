import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ATTESTLEDGERIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type AttestledgerizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AttestledgerizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AttestledgerizabilityRolloutCheck[]
  guidance: string
}

export type AttestledgerizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAttestledgerizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateAttestledgerizabilityRollout(
  input: AttestledgerizabilityRolloutInput,
): AttestledgerizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const attestledgerizabilityTableCoverageComplete =
    input.existingAttestledgerizabilityTableCount === CRITICAL_ATTESTLEDGERIZABILITY_TABLES.length

  const checks: AttestledgerizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL attestledgerizability checks can reach the database.'
            : 'Production attestledgerizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'attestledgerizability_signal_table_coverage',
      label: 'Attestledgerizability signal table coverage',
      status: attestledgerizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Attestledgerizability signal table coverage is only enforced in production.'
          : attestledgerizabilityTableCoverageComplete
            ? `${input.existingAttestledgerizabilityTableCount}/${CRITICAL_ATTESTLEDGERIZABILITY_TABLES.length} attestledgerizability signal tables are present.`
            : `${input.existingAttestledgerizabilityTableCount}/${CRITICAL_ATTESTLEDGERIZABILITY_TABLES.length} attestledgerizability signal tables were found.`,
    },
    {
      name: 'membership_attestledgerizability',
      label: 'Membership attestledgerizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership attestledgerizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership attestledgerizability signals.'
            : 'Production attestledgerizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_attestledgerizability',
      label: 'Usage event attestledgerizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event attestledgerizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event attestledgerizability signals.'
            : 'Production attestledgerizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          attestledgerizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              attestledgerizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production attestledgerizability rollout requires PostgreSQL connectivity, attestledgerizability tables, membership attestledgerizability, usage event attestledgerizability, and full signal coverage.',
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
        ? 'Production attestledgerizability rollout checks passed. Attestledgerizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production attestledgerizability rollout is not ready. Resolve failed checks before relying on production attestledgerizability tooling.',
  }
}

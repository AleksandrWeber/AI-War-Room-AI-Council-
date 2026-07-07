import type { ApiEnv } from '../config/env.js'

export const CRITICAL_POLICYIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type PolicyizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type PolicyizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: PolicyizabilityRolloutCheck[]
  guidance: string
}

export type PolicyizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingPolicyizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluatePolicyizabilityRollout(
  input: PolicyizabilityRolloutInput,
): PolicyizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const policyizabilityTableCoverageComplete =
    input.existingPolicyizabilityTableCount === CRITICAL_POLICYIZABILITY_TABLES.length

  const checks: PolicyizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL policyizability checks can reach the database.'
            : 'Production policyizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'policyizability_signal_table_coverage',
      label: 'Policyizability signal table coverage',
      status: policyizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Policyizability signal table coverage is only enforced in production.'
          : policyizabilityTableCoverageComplete
            ? `${input.existingPolicyizabilityTableCount}/${CRITICAL_POLICYIZABILITY_TABLES.length} policyizability signal tables are present.`
            : `${input.existingPolicyizabilityTableCount}/${CRITICAL_POLICYIZABILITY_TABLES.length} policyizability signal tables were found.`,
    },
    {
      name: 'membership_policyizability',
      label: 'Membership policyizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership policyizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership policyizability signals.'
            : 'Production policyizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_policyizability',
      label: 'Usage event policyizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event policyizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event policyizability signals.'
            : 'Production policyizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          policyizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              policyizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production policyizability rollout requires PostgreSQL connectivity, policyizability tables, membership policyizability, usage event policyizability, and full signal coverage.',
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
        ? 'Production policyizability rollout checks passed. Policyizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production policyizability rollout is not ready. Resolve failed checks before relying on production policyizability tooling.',
  }
}

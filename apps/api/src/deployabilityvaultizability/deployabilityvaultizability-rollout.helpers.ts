import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DEPLOYABILITYVAULTIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type DeployabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DeployabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DeployabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type DeployabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDeployabilityvaultizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateDeployabilityvaultizabilityRollout(
  input: DeployabilityvaultizabilityRolloutInput,
): DeployabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const deployabilityvaultizabilityTableCoverageComplete =
    input.existingDeployabilityvaultizabilityTableCount === CRITICAL_DEPLOYABILITYVAULTIZABILITY_TABLES.length

  const checks: DeployabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL deployabilityvaultizability checks can reach the database.'
            : 'Production deployabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'deployabilityvaultizability_signal_table_coverage',
      label: 'Deployabilityvaultizability signal table coverage',
      status: deployabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Deployabilityvaultizability signal table coverage is only enforced in production.'
          : deployabilityvaultizabilityTableCoverageComplete
            ? `${input.existingDeployabilityvaultizabilityTableCount}/${CRITICAL_DEPLOYABILITYVAULTIZABILITY_TABLES.length} deployabilityvaultizability signal tables are present.`
            : `${input.existingDeployabilityvaultizabilityTableCount}/${CRITICAL_DEPLOYABILITYVAULTIZABILITY_TABLES.length} deployabilityvaultizability signal tables were found.`,
    },
    {
      name: 'membership_deployabilityvaultizability',
      label: 'Membership deployabilityvaultizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership deployabilityvaultizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership deployabilityvaultizability signals.'
            : 'Production deployabilityvaultizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_deployabilityvaultizability',
      label: 'Usage event deployabilityvaultizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event deployabilityvaultizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event deployabilityvaultizability signals.'
            : 'Production deployabilityvaultizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          deployabilityvaultizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              deployabilityvaultizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production deployabilityvaultizability rollout requires PostgreSQL connectivity, deployabilityvaultizability tables, membership deployabilityvaultizability, usage event deployabilityvaultizability, and full signal coverage.',
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
        ? 'Production deployabilityvaultizability rollout checks passed. Deployabilityvaultizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production deployabilityvaultizability rollout is not ready. Resolve failed checks before relying on production deployabilityvaultizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_IDENTIFIABILITYVAULTIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type IdentifiabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type IdentifiabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: IdentifiabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type IdentifiabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingIdentifiabilityvaultizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateIdentifiabilityvaultizabilityRollout(
  input: IdentifiabilityvaultizabilityRolloutInput,
): IdentifiabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const identifiabilityvaultizabilityTableCoverageComplete =
    input.existingIdentifiabilityvaultizabilityTableCount === CRITICAL_IDENTIFIABILITYVAULTIZABILITY_TABLES.length

  const checks: IdentifiabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL identifiabilityvaultizability checks can reach the database.'
            : 'Production identifiabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'identifiabilityvaultizability_signal_table_coverage',
      label: 'Identifiabilityvaultizability signal table coverage',
      status: identifiabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Identifiabilityvaultizability signal table coverage is only enforced in production.'
          : identifiabilityvaultizabilityTableCoverageComplete
            ? `${input.existingIdentifiabilityvaultizabilityTableCount}/${CRITICAL_IDENTIFIABILITYVAULTIZABILITY_TABLES.length} identifiabilityvaultizability signal tables are present.`
            : `${input.existingIdentifiabilityvaultizabilityTableCount}/${CRITICAL_IDENTIFIABILITYVAULTIZABILITY_TABLES.length} identifiabilityvaultizability signal tables were found.`,
    },
    {
      name: 'membership_identifiabilityvaultizability',
      label: 'Membership identifiabilityvaultizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership identifiabilityvaultizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership identifiabilityvaultizability signals.'
            : 'Production identifiabilityvaultizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_identifiabilityvaultizability',
      label: 'Usage event identifiabilityvaultizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event identifiabilityvaultizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event identifiabilityvaultizability signals.'
            : 'Production identifiabilityvaultizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          identifiabilityvaultizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              identifiabilityvaultizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production identifiabilityvaultizability rollout requires PostgreSQL connectivity, identifiabilityvaultizability tables, membership identifiabilityvaultizability, usage event identifiabilityvaultizability, and full signal coverage.',
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
        ? 'Production identifiabilityvaultizability rollout checks passed. Identifiabilityvaultizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production identifiabilityvaultizability rollout is not ready. Resolve failed checks before relying on production identifiabilityvaultizability tooling.',
  }
}

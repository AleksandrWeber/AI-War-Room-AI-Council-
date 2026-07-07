import type { ApiEnv } from '../config/env.js'

export const CRITICAL_LINKABILITYVAULTIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type LinkabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type LinkabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: LinkabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type LinkabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingLinkabilityvaultizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateLinkabilityvaultizabilityRollout(
  input: LinkabilityvaultizabilityRolloutInput,
): LinkabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const linkabilityvaultizabilityTableCoverageComplete =
    input.existingLinkabilityvaultizabilityTableCount === CRITICAL_LINKABILITYVAULTIZABILITY_TABLES.length

  const checks: LinkabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL linkabilityvaultizability checks can reach the database.'
            : 'Production linkabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'linkabilityvaultizability_signal_table_coverage',
      label: 'Linkabilityvaultizability signal table coverage',
      status: linkabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Linkabilityvaultizability signal table coverage is only enforced in production.'
          : linkabilityvaultizabilityTableCoverageComplete
            ? `${input.existingLinkabilityvaultizabilityTableCount}/${CRITICAL_LINKABILITYVAULTIZABILITY_TABLES.length} linkabilityvaultizability signal tables are present.`
            : `${input.existingLinkabilityvaultizabilityTableCount}/${CRITICAL_LINKABILITYVAULTIZABILITY_TABLES.length} linkabilityvaultizability signal tables were found.`,
    },
    {
      name: 'membership_linkabilityvaultizability',
      label: 'Membership linkabilityvaultizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership linkabilityvaultizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership linkabilityvaultizability signals.'
            : 'Production linkabilityvaultizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_linkabilityvaultizability',
      label: 'Usage event linkabilityvaultizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event linkabilityvaultizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event linkabilityvaultizability signals.'
            : 'Production linkabilityvaultizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          linkabilityvaultizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              linkabilityvaultizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production linkabilityvaultizability rollout requires PostgreSQL connectivity, linkabilityvaultizability tables, membership linkabilityvaultizability, usage event linkabilityvaultizability, and full signal coverage.',
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
        ? 'Production linkabilityvaultizability rollout checks passed. Linkabilityvaultizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production linkabilityvaultizability rollout is not ready. Resolve failed checks before relying on production linkabilityvaultizability tooling.',
  }
}

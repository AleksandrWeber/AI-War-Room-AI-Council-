import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ONTOLOGIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type OntologizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type OntologizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: OntologizabilityRolloutCheck[]
  guidance: string
}

export type OntologizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingOntologizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateOntologizabilityRollout(
  input: OntologizabilityRolloutInput,
): OntologizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const ontologizabilityTableCoverageComplete =
    input.existingOntologizabilityTableCount === CRITICAL_ONTOLOGIZABILITY_TABLES.length

  const checks: OntologizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL ontologizability checks can reach the database.'
            : 'Production ontologizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'ontologizability_signal_table_coverage',
      label: 'Ontologizability signal table coverage',
      status: ontologizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Ontologizability signal table coverage is only enforced in production.'
          : ontologizabilityTableCoverageComplete
            ? `${input.existingOntologizabilityTableCount}/${CRITICAL_ONTOLOGIZABILITY_TABLES.length} ontologizability signal tables are present.`
            : `${input.existingOntologizabilityTableCount}/${CRITICAL_ONTOLOGIZABILITY_TABLES.length} ontologizability signal tables were found.`,
    },
    {
      name: 'membership_ontologizability',
      label: 'Membership ontologizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership ontologizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership ontologizability signals.'
            : 'Production ontologizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_ontologizability',
      label: 'Usage event ontologizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event ontologizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event ontologizability signals.'
            : 'Production ontologizability rollout requires a usage_events table.',
    },
    {
      name: 'ontologization_readiness_signal',
      label: 'Ontologization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          ontologizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Ontologization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              ontologizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support ontologization readiness.'
            : 'Production ontologizability rollout requires PostgreSQL connectivity, ontologizability tables, membership ontologizability, usage event ontologizability, and full signal coverage.',
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
        ? 'Production ontologizability rollout checks passed. Ontologizability coverage and ontologization readiness signal signals are healthy.'
        : 'Production ontologizability rollout is not ready. Resolve failed checks before relying on production ontologizability tooling.',
  }
}

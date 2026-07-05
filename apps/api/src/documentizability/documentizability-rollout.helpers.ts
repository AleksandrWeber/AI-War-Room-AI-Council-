import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DOCUMENTIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type DocumentizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DocumentizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DocumentizabilityRolloutCheck[]
  guidance: string
}

export type DocumentizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDocumentizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateDocumentizabilityRollout(
  input: DocumentizabilityRolloutInput,
): DocumentizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const documentizabilityTableCoverageComplete =
    input.existingDocumentizabilityTableCount === CRITICAL_DOCUMENTIZABILITY_TABLES.length

  const checks: DocumentizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL documentizability checks can reach the database.'
            : 'Production documentizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'documentizability_signal_table_coverage',
      label: 'Documentizability signal table coverage',
      status: documentizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Documentizability signal table coverage is only enforced in production.'
          : documentizabilityTableCoverageComplete
            ? `${input.existingDocumentizabilityTableCount}/${CRITICAL_DOCUMENTIZABILITY_TABLES.length} documentizability signal tables are present.`
            : `${input.existingDocumentizabilityTableCount}/${CRITICAL_DOCUMENTIZABILITY_TABLES.length} documentizability signal tables were found.`,
    },
    {
      name: 'membership_documentizability',
      label: 'Membership documentizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership documentizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership documentizability signals.'
            : 'Production documentizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_documentizability',
      label: 'Usage event documentizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event documentizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event documentizability signals.'
            : 'Production documentizability rollout requires a usage_events table.',
    },
    {
      name: 'documentization_readiness_signal',
      label: 'Documentization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          documentizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Documentization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              documentizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support documentization readiness.'
            : 'Production documentizability rollout requires PostgreSQL connectivity, documentizability tables, membership documentizability, usage event documentizability, and full signal coverage.',
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
        ? 'Production documentizability rollout checks passed. Documentizability coverage and documentization readiness signal signals are healthy.'
        : 'Production documentizability rollout is not ready. Resolve failed checks before relying on production documentizability tooling.',
  }
}

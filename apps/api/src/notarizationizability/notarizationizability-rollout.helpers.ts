import type { ApiEnv } from '../config/env.js'

export const CRITICAL_NOTARIZATIONIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type NotarizationizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type NotarizationizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: NotarizationizabilityRolloutCheck[]
  guidance: string
}

export type NotarizationizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingNotarizationizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateNotarizationizabilityRollout(
  input: NotarizationizabilityRolloutInput,
): NotarizationizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const notarizationizabilityTableCoverageComplete =
    input.existingNotarizationizabilityTableCount === CRITICAL_NOTARIZATIONIZABILITY_TABLES.length

  const checks: NotarizationizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL notarizationizability checks can reach the database.'
            : 'Production notarizationizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'notarizationizability_signal_table_coverage',
      label: 'Notarizationizability signal table coverage',
      status: notarizationizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Notarizationizability signal table coverage is only enforced in production.'
          : notarizationizabilityTableCoverageComplete
            ? `${input.existingNotarizationizabilityTableCount}/${CRITICAL_NOTARIZATIONIZABILITY_TABLES.length} notarizationizability signal tables are present.`
            : `${input.existingNotarizationizabilityTableCount}/${CRITICAL_NOTARIZATIONIZABILITY_TABLES.length} notarizationizability signal tables were found.`,
    },
    {
      name: 'membership_notarizationizability',
      label: 'Membership notarizationizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership notarizationizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership notarizationizability signals.'
            : 'Production notarizationizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_notarizationizability',
      label: 'Usage event notarizationizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event notarizationizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event notarizationizability signals.'
            : 'Production notarizationizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          notarizationizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              notarizationizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production notarizationizability rollout requires PostgreSQL connectivity, notarizationizability tables, membership notarizationizability, usage event notarizationizability, and full signal coverage.',
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
        ? 'Production notarizationizability rollout checks passed. Notarizationizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production notarizationizability rollout is not ready. Resolve failed checks before relying on production notarizationizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_LEXICALIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type LexicalizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type LexicalizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: LexicalizabilityRolloutCheck[]
  guidance: string
}

export type LexicalizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingLexicalizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateLexicalizabilityRollout(
  input: LexicalizabilityRolloutInput,
): LexicalizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const lexicalizabilityTableCoverageComplete =
    input.existingLexicalizabilityTableCount === CRITICAL_LEXICALIZABILITY_TABLES.length

  const checks: LexicalizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL lexicalizability checks can reach the database.'
            : 'Production lexicalizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'lexicalizability_signal_table_coverage',
      label: 'Lexicalizability signal table coverage',
      status: lexicalizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Lexicalizability signal table coverage is only enforced in production.'
          : lexicalizabilityTableCoverageComplete
            ? `${input.existingLexicalizabilityTableCount}/${CRITICAL_LEXICALIZABILITY_TABLES.length} lexicalizability signal tables are present.`
            : `${input.existingLexicalizabilityTableCount}/${CRITICAL_LEXICALIZABILITY_TABLES.length} lexicalizability signal tables were found.`,
    },
    {
      name: 'membership_lexicalizability',
      label: 'Membership lexicalizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership lexicalizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership lexicalizability signals.'
            : 'Production lexicalizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_lexicalizability',
      label: 'Usage event lexicalizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event lexicalizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event lexicalizability signals.'
            : 'Production lexicalizability rollout requires a usage_events table.',
    },
    {
      name: 'lexicalization_readiness_signal',
      label: 'Lexicalization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          lexicalizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Lexicalization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              lexicalizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support lexicalization readiness.'
            : 'Production lexicalizability rollout requires PostgreSQL connectivity, lexicalizability tables, membership lexicalizability, usage event lexicalizability, and full signal coverage.',
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
        ? 'Production lexicalizability rollout checks passed. Lexicalizability coverage and lexicalization readiness signal signals are healthy.'
        : 'Production lexicalizability rollout is not ready. Resolve failed checks before relying on production lexicalizability tooling.',
  }
}

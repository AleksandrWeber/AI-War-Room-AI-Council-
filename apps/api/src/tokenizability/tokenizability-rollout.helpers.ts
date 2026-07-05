import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TOKENIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type TokenizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TokenizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TokenizabilityRolloutCheck[]
  guidance: string
}

export type TokenizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTokenizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateTokenizabilityRollout(
  input: TokenizabilityRolloutInput,
): TokenizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const tokenizabilityTableCoverageComplete =
    input.existingTokenizabilityTableCount === CRITICAL_TOKENIZABILITY_TABLES.length

  const checks: TokenizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL tokenizability checks can reach the database.'
            : 'Production tokenizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'tokenizability_signal_table_coverage',
      label: 'Tokenizability signal table coverage',
      status: tokenizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Tokenizability signal table coverage is only enforced in production.'
          : tokenizabilityTableCoverageComplete
            ? `${input.existingTokenizabilityTableCount}/${CRITICAL_TOKENIZABILITY_TABLES.length} tokenizability signal tables are present.`
            : `${input.existingTokenizabilityTableCount}/${CRITICAL_TOKENIZABILITY_TABLES.length} tokenizability signal tables were found.`,
    },
    {
      name: 'membership_tokenizability',
      label: 'Membership tokenizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership tokenizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership tokenizability signals.'
            : 'Production tokenizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_tokenizability',
      label: 'Usage event tokenizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event tokenizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event tokenizability signals.'
            : 'Production tokenizability rollout requires a usage_events table.',
    },
    {
      name: 'tokenization_readiness_signal',
      label: 'Tokenization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          tokenizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Tokenization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              tokenizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support tokenization readiness.'
            : 'Production tokenizability rollout requires PostgreSQL connectivity, tokenizability tables, membership tokenizability, usage event tokenizability, and full signal coverage.',
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
        ? 'Production tokenizability rollout checks passed. Tokenizability coverage and tokenization readiness signal signals are healthy.'
        : 'Production tokenizability rollout is not ready. Resolve failed checks before relying on production tokenizability tooling.',
  }
}

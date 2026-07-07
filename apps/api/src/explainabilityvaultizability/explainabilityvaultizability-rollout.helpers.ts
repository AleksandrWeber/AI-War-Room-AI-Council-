import type { ApiEnv } from '../config/env.js'

export const CRITICAL_EXPLAINABILITYVAULTIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type ExplainabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ExplainabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ExplainabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type ExplainabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingExplainabilityvaultizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateExplainabilityvaultizabilityRollout(
  input: ExplainabilityvaultizabilityRolloutInput,
): ExplainabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const explainabilityvaultizabilityTableCoverageComplete =
    input.existingExplainabilityvaultizabilityTableCount === CRITICAL_EXPLAINABILITYVAULTIZABILITY_TABLES.length

  const checks: ExplainabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL explainabilityvaultizability checks can reach the database.'
            : 'Production explainabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'explainabilityvaultizability_signal_table_coverage',
      label: 'Explainabilityvaultizability signal table coverage',
      status: explainabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Explainabilityvaultizability signal table coverage is only enforced in production.'
          : explainabilityvaultizabilityTableCoverageComplete
            ? `${input.existingExplainabilityvaultizabilityTableCount}/${CRITICAL_EXPLAINABILITYVAULTIZABILITY_TABLES.length} explainabilityvaultizability signal tables are present.`
            : `${input.existingExplainabilityvaultizabilityTableCount}/${CRITICAL_EXPLAINABILITYVAULTIZABILITY_TABLES.length} explainabilityvaultizability signal tables were found.`,
    },
    {
      name: 'membership_explainabilityvaultizability',
      label: 'Membership explainabilityvaultizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership explainabilityvaultizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership explainabilityvaultizability signals.'
            : 'Production explainabilityvaultizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_explainabilityvaultizability',
      label: 'Usage event explainabilityvaultizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event explainabilityvaultizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event explainabilityvaultizability signals.'
            : 'Production explainabilityvaultizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          explainabilityvaultizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              explainabilityvaultizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production explainabilityvaultizability rollout requires PostgreSQL connectivity, explainabilityvaultizability tables, membership explainabilityvaultizability, usage event explainabilityvaultizability, and full signal coverage.',
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
        ? 'Production explainabilityvaultizability rollout checks passed. Explainabilityvaultizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production explainabilityvaultizability rollout is not ready. Resolve failed checks before relying on production explainabilityvaultizability tooling.',
  }
}

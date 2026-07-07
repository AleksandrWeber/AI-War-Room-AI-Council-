import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ADAPTABILITYVAULTIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type AdaptabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AdaptabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AdaptabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type AdaptabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAdaptabilityvaultizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateAdaptabilityvaultizabilityRollout(
  input: AdaptabilityvaultizabilityRolloutInput,
): AdaptabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const adaptabilityvaultizabilityTableCoverageComplete =
    input.existingAdaptabilityvaultizabilityTableCount === CRITICAL_ADAPTABILITYVAULTIZABILITY_TABLES.length

  const checks: AdaptabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL adaptabilityvaultizability checks can reach the database.'
            : 'Production adaptabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'adaptabilityvaultizability_signal_table_coverage',
      label: 'Adaptabilityvaultizability signal table coverage',
      status: adaptabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Adaptabilityvaultizability signal table coverage is only enforced in production.'
          : adaptabilityvaultizabilityTableCoverageComplete
            ? `${input.existingAdaptabilityvaultizabilityTableCount}/${CRITICAL_ADAPTABILITYVAULTIZABILITY_TABLES.length} adaptabilityvaultizability signal tables are present.`
            : `${input.existingAdaptabilityvaultizabilityTableCount}/${CRITICAL_ADAPTABILITYVAULTIZABILITY_TABLES.length} adaptabilityvaultizability signal tables were found.`,
    },
    {
      name: 'membership_adaptabilityvaultizability',
      label: 'Membership adaptabilityvaultizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership adaptabilityvaultizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership adaptabilityvaultizability signals.'
            : 'Production adaptabilityvaultizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_adaptabilityvaultizability',
      label: 'Usage event adaptabilityvaultizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event adaptabilityvaultizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event adaptabilityvaultizability signals.'
            : 'Production adaptabilityvaultizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          adaptabilityvaultizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              adaptabilityvaultizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production adaptabilityvaultizability rollout requires PostgreSQL connectivity, adaptabilityvaultizability tables, membership adaptabilityvaultizability, usage event adaptabilityvaultizability, and full signal coverage.',
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
        ? 'Production adaptabilityvaultizability rollout checks passed. Adaptabilityvaultizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production adaptabilityvaultizability rollout is not ready. Resolve failed checks before relying on production adaptabilityvaultizability tooling.',
  }
}

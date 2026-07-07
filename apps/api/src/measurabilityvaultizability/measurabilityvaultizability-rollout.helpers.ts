import type { ApiEnv } from '../config/env.js'

export const CRITICAL_MEASURABILITYVAULTIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type MeasurabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type MeasurabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: MeasurabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type MeasurabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingMeasurabilityvaultizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateMeasurabilityvaultizabilityRollout(
  input: MeasurabilityvaultizabilityRolloutInput,
): MeasurabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const measurabilityvaultizabilityTableCoverageComplete =
    input.existingMeasurabilityvaultizabilityTableCount === CRITICAL_MEASURABILITYVAULTIZABILITY_TABLES.length

  const checks: MeasurabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL measurabilityvaultizability checks can reach the database.'
            : 'Production measurabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'measurabilityvaultizability_signal_table_coverage',
      label: 'Measurabilityvaultizability signal table coverage',
      status: measurabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Measurabilityvaultizability signal table coverage is only enforced in production.'
          : measurabilityvaultizabilityTableCoverageComplete
            ? `${input.existingMeasurabilityvaultizabilityTableCount}/${CRITICAL_MEASURABILITYVAULTIZABILITY_TABLES.length} measurabilityvaultizability signal tables are present.`
            : `${input.existingMeasurabilityvaultizabilityTableCount}/${CRITICAL_MEASURABILITYVAULTIZABILITY_TABLES.length} measurabilityvaultizability signal tables were found.`,
    },
    {
      name: 'membership_measurabilityvaultizability',
      label: 'Membership measurabilityvaultizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership measurabilityvaultizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership measurabilityvaultizability signals.'
            : 'Production measurabilityvaultizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_measurabilityvaultizability',
      label: 'Usage event measurabilityvaultizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event measurabilityvaultizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event measurabilityvaultizability signals.'
            : 'Production measurabilityvaultizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          measurabilityvaultizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              measurabilityvaultizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production measurabilityvaultizability rollout requires PostgreSQL connectivity, measurabilityvaultizability tables, membership measurabilityvaultizability, usage event measurabilityvaultizability, and full signal coverage.',
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
        ? 'Production measurabilityvaultizability rollout checks passed. Measurabilityvaultizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production measurabilityvaultizability rollout is not ready. Resolve failed checks before relying on production measurabilityvaultizability tooling.',
  }
}

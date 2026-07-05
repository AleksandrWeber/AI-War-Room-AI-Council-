import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PUBLISHIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type PublishizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type PublishizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: PublishizabilityRolloutCheck[]
  guidance: string
}

export type PublishizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingPublishizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluatePublishizabilityRollout(
  input: PublishizabilityRolloutInput,
): PublishizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const publishizabilityTableCoverageComplete =
    input.existingPublishizabilityTableCount === CRITICAL_PUBLISHIZABILITY_TABLES.length

  const checks: PublishizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL publishizability checks can reach the database.'
            : 'Production publishizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'publishizability_signal_table_coverage',
      label: 'Publishizability signal table coverage',
      status: publishizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Publishizability signal table coverage is only enforced in production.'
          : publishizabilityTableCoverageComplete
            ? `${input.existingPublishizabilityTableCount}/${CRITICAL_PUBLISHIZABILITY_TABLES.length} publishizability signal tables are present.`
            : `${input.existingPublishizabilityTableCount}/${CRITICAL_PUBLISHIZABILITY_TABLES.length} publishizability signal tables were found.`,
    },
    {
      name: 'meter_usage_publishizability',
      label: 'Meter usage publishizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage publishizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage publishizability signals.'
            : 'Production publishizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_publishizability',
      label: 'Usage event publishizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event publishizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event publishizability signals.'
            : 'Production publishizability rollout requires a usage_events table.',
    },
    {
      name: 'publishization_readiness_signal',
      label: 'Distributization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          publishizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Distributization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              publishizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support publishization readiness.'
            : 'Production publishizability rollout requires PostgreSQL connectivity, publishizability tables, meter usage publishizability, usage event publishizability, and full signal coverage.',
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
        ? 'Production publishizability rollout checks passed. Publishizability coverage and distributization readiness signal signals are healthy.'
        : 'Production publishizability rollout is not ready. Resolve failed checks before relying on production publishizability tooling.',
  }
}

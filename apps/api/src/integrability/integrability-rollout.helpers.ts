import type { ApiEnv } from '../config/env.js'

export const CRITICAL_INTEGRABILITY_TABLES = [
  'billing_webhook_events',
  'billing_meter_usage_reports',
  'workspace_memberships',
] as const

export type IntegrabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type IntegrabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: IntegrabilityRolloutCheck[]
  guidance: string
}

export type IntegrabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingIntegrabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingMeterUsageReportsTableExists: boolean
  workspaceMembershipsTableExists: boolean
}

export function evaluateIntegrabilityRollout(
  input: IntegrabilityRolloutInput,
): IntegrabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const integrabilityTableCoverageComplete =
    input.existingIntegrabilityTableCount === CRITICAL_INTEGRABILITY_TABLES.length

  const checks: IntegrabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL integrability checks can reach the database.'
            : 'Production integrability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'integrability_signal_table_coverage',
      label: 'Integrability signal table coverage',
      status: integrabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Integrability signal table coverage is only enforced in production.'
          : integrabilityTableCoverageComplete
            ? `${input.existingIntegrabilityTableCount}/${CRITICAL_INTEGRABILITY_TABLES.length} integrability signal tables are present.`
            : `${input.existingIntegrabilityTableCount}/${CRITICAL_INTEGRABILITY_TABLES.length} integrability signal tables were found.`,
    },
    {
      name: 'billing_webhook_integrability',
      label: 'Billing webhook integrability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook integrability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook integrability signals.'
            : 'Production integrability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'meter_usage_integrability',
      label: 'Meter usage integrability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage integrability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage integrability signals.'
            : 'Production integrability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'integration_readiness_signal',
      label: 'Integration readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          integrabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingMeterUsageReportsTableExists &&
          input.workspaceMembershipsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Integration readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              integrabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingMeterUsageReportsTableExists &&
              input.workspaceMembershipsTableExists
            ? 'Billing webhook events, meter usage reports, and workspace memberships support integration readiness.'
            : 'Production integrability rollout requires PostgreSQL connectivity, integrability tables, billing webhook integrability, meter usage integrability, and full signal coverage.',
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
        ? 'Production integrability rollout checks passed. Integrability coverage and integration readiness signal signals are healthy.'
        : 'Production integrability rollout is not ready. Resolve failed checks before relying on production integrability tooling.',
  }
}

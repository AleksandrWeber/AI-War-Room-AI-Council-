import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SUSTAINABILITY_TABLES = [
  'billing_records',
  'usage_events',
  'artifacts',
] as const

export type SustainabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SustainabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SustainabilityRolloutCheck[]
  guidance: string
}

export type SustainabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSustainabilityTableCount: number
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
  artifactsTableExists: boolean
}

export function evaluateSustainabilityRollout(
  input: SustainabilityRolloutInput,
): SustainabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const sustainabilityTableCoverageComplete =
    input.existingSustainabilityTableCount ===
    CRITICAL_SUSTAINABILITY_TABLES.length

  const checks: SustainabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL sustainability checks can reach the database.'
            : 'Production sustainability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'sustainability_signal_table_coverage',
      label: 'Sustainability signal table coverage',
      status:
        sustainabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Sustainability signal table coverage is only enforced in production.'
          : sustainabilityTableCoverageComplete
            ? `${input.existingSustainabilityTableCount}/${CRITICAL_SUSTAINABILITY_TABLES.length} sustainability signal tables are present.`
            : `${input.existingSustainabilityTableCount}/${CRITICAL_SUSTAINABILITY_TABLES.length} sustainability signal tables were found.`,
    },
    {
      name: 'billing_sustainability',
      label: 'Billing sustainability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing sustainability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing sustainability signals.'
            : 'Production sustainability rollout requires a billing_records table.',
    },
    {
      name: 'usage_sustainability',
      label: 'Usage sustainability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage sustainability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage sustainability signals.'
            : 'Production sustainability rollout requires a usage_events table.',
    },
    {
      name: 'operational_readiness_signal',
      label: 'Operational readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          sustainabilityTableCoverageComplete &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists &&
          input.artifactsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Operational readiness is only enforced in production.'
          : input.postgresConnectivity &&
              sustainabilityTableCoverageComplete &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists &&
              input.artifactsTableExists
            ? 'Billing records, usage telemetry, and persisted artifacts support operational readiness.'
            : 'Production sustainability rollout requires PostgreSQL connectivity, sustainability tables, billing coverage, usage telemetry, and artifact persistence.',
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
        ? 'Production sustainability rollout checks passed. Sustainability coverage and operational readiness signals are healthy.'
        : 'Production sustainability rollout is not ready. Resolve failed checks before relying on production sustainability tooling.',
  }
}

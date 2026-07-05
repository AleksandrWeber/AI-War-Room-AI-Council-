import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ARCHIVIZABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type ArchivizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ArchivizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ArchivizabilityRolloutCheck[]
  guidance: string
}

export type ArchivizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingArchivizabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateArchivizabilityRollout(
  input: ArchivizabilityRolloutInput,
): ArchivizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const archivizabilityTableCoverageComplete =
    input.existingArchivizabilityTableCount === CRITICAL_ARCHIVIZABILITY_TABLES.length

  const checks: ArchivizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL archivizability checks can reach the database.'
            : 'Production archivizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'archivizability_signal_table_coverage',
      label: 'Archivizability signal table coverage',
      status: archivizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Archivizability signal table coverage is only enforced in production.'
          : archivizabilityTableCoverageComplete
            ? `${input.existingArchivizabilityTableCount}/${CRITICAL_ARCHIVIZABILITY_TABLES.length} archivizability signal tables are present.`
            : `${input.existingArchivizabilityTableCount}/${CRITICAL_ARCHIVIZABILITY_TABLES.length} archivizability signal tables were found.`,
    },
    {
      name: 'billing_webhook_archivizability',
      label: 'Billing webhook archivizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook archivizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook archivizability signals.'
            : 'Production archivizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_archivizability',
      label: 'Billing record archivizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record archivizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record archivizability signals.'
            : 'Production archivizability rollout requires a billing_records table.',
    },
    {
      name: 'archivization_readiness_signal',
      label: 'Archivization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          archivizabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Archivization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              archivizabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support archivization readiness.'
            : 'Production archivizability rollout requires PostgreSQL connectivity, archivizability tables, billing webhook archivizability, billing record archivizability, and full signal coverage.',
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
        ? 'Production archivizability rollout checks passed. Archivizability coverage and archivization readiness signal signals are healthy.'
        : 'Production archivizability rollout is not ready. Resolve failed checks before relying on production archivizability tooling.',
  }
}

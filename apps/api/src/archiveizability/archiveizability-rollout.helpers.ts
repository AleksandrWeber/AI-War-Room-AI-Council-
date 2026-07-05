import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ARCHIVEIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type ArchiveizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ArchiveizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ArchiveizabilityRolloutCheck[]
  guidance: string
}

export type ArchiveizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingArchiveizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateArchiveizabilityRollout(
  input: ArchiveizabilityRolloutInput,
): ArchiveizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const archiveizabilityTableCoverageComplete =
    input.existingArchiveizabilityTableCount === CRITICAL_ARCHIVEIZABILITY_TABLES.length

  const checks: ArchiveizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL archiveizability checks can reach the database.'
            : 'Production archiveizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'archiveizability_signal_table_coverage',
      label: 'Archiveizability signal table coverage',
      status: archiveizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Archiveizability signal table coverage is only enforced in production.'
          : archiveizabilityTableCoverageComplete
            ? `${input.existingArchiveizabilityTableCount}/${CRITICAL_ARCHIVEIZABILITY_TABLES.length} archiveizability signal tables are present.`
            : `${input.existingArchiveizabilityTableCount}/${CRITICAL_ARCHIVEIZABILITY_TABLES.length} archiveizability signal tables were found.`,
    },
    {
      name: 'billing_notification_archiveizability',
      label: 'Billing notification archiveizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification archiveizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification archiveizability signals.'
            : 'Production archiveizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_archiveizability',
      label: 'Billing webhook archiveizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook archiveizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook archiveizability signals.'
            : 'Production archiveizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'archiveization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          archiveizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              archiveizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support archiveization readiness.'
            : 'Production archiveizability rollout requires PostgreSQL connectivity, archiveizability tables, billing notification archiveizability, billing webhook archiveizability, and full signal coverage.',
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
        ? 'Production archiveizability rollout checks passed. Archiveizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production archiveizability rollout is not ready. Resolve failed checks before relying on production archiveizability tooling.',
  }
}

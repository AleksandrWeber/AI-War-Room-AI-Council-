import type { ApiEnv } from '../config/env.js'

export const CRITICAL_MESHINGIZABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type MeshingizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type MeshingizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: MeshingizabilityRolloutCheck[]
  guidance: string
}

export type MeshingizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingMeshingizabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateMeshingizabilityRollout(
  input: MeshingizabilityRolloutInput,
): MeshingizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const meshingizabilityTableCoverageComplete =
    input.existingMeshingizabilityTableCount === CRITICAL_MESHINGIZABILITY_TABLES.length

  const checks: MeshingizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL meshingizability checks can reach the database.'
            : 'Production meshingizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'meshingizability_signal_table_coverage',
      label: 'Meshingizability signal table coverage',
      status: meshingizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meshingizability signal table coverage is only enforced in production.'
          : meshingizabilityTableCoverageComplete
            ? `${input.existingMeshingizabilityTableCount}/${CRITICAL_MESHINGIZABILITY_TABLES.length} meshingizability signal tables are present.`
            : `${input.existingMeshingizabilityTableCount}/${CRITICAL_MESHINGIZABILITY_TABLES.length} meshingizability signal tables were found.`,
    },
    {
      name: 'billing_notification_meshingizability',
      label: 'Billing notification meshingizability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification meshingizability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification meshingizability signals.'
            : 'Production meshingizability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_meshingizability',
      label: 'Billing webhook meshingizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook meshingizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook meshingizability signals.'
            : 'Production meshingizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'meshingization_readiness_signal',
      label: 'Boundarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          meshingizabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Boundarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              meshingizabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support meshingization readiness.'
            : 'Production meshingizability rollout requires PostgreSQL connectivity, meshingizability tables, billing notification meshingizability, billing webhook meshingizability, and full signal coverage.',
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
        ? 'Production meshingizability rollout checks passed. Meshingizability coverage and boundarization readiness signal signals are healthy.'
        : 'Production meshingizability rollout is not ready. Resolve failed checks before relying on production meshingizability tooling.',
  }
}

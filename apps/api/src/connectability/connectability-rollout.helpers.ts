import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CONNECTABILITY_TABLES = [
  'usage_events',
  'billing_webhook_events',
  'workspace_provider_credentials',
] as const

export type ConnectabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ConnectabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ConnectabilityRolloutCheck[]
  guidance: string
}

export type ConnectabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingConnectabilityTableCount: number
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
}

export function evaluateConnectabilityRollout(
  input: ConnectabilityRolloutInput,
): ConnectabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const connectabilityTableCoverageComplete =
    input.existingConnectabilityTableCount === CRITICAL_CONNECTABILITY_TABLES.length

  const checks: ConnectabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL connectability checks can reach the database.'
            : 'Production connectability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'connectability_signal_table_coverage',
      label: 'Connectability signal table coverage',
      status: connectabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Connectability signal table coverage is only enforced in production.'
          : connectabilityTableCoverageComplete
            ? `${input.existingConnectabilityTableCount}/${CRITICAL_CONNECTABILITY_TABLES.length} connectability signal tables are present.`
            : `${input.existingConnectabilityTableCount}/${CRITICAL_CONNECTABILITY_TABLES.length} connectability signal tables were found.`,
    },
    {
      name: 'usage_event_connectability',
      label: 'Usage event connectability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event connectability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event connectability signals.'
            : 'Production connectability rollout requires a usage_events table.',
    },
    {
      name: 'billing_webhook_connectability',
      label: 'Billing webhook connectability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook connectability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook connectability signals.'
            : 'Production connectability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'connection_readiness_signal',
      label: 'Connection readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          connectabilityTableCoverageComplete &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.workspaceProviderCredentialsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Connection readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              connectabilityTableCoverageComplete &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.workspaceProviderCredentialsTableExists
            ? 'Usage events, billing webhook events, and workspace provider credentials support connection readiness.'
            : 'Production connectability rollout requires PostgreSQL connectivity, connectability tables, usage event connectability, billing webhook connectability, and full signal coverage.',
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
        ? 'Production connectability rollout checks passed. Connectability coverage and connection readiness signal signals are healthy.'
        : 'Production connectability rollout is not ready. Resolve failed checks before relying on production connectability tooling.',
  }
}

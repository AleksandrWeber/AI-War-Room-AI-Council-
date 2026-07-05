import type { ApiEnv } from '../config/env.js'

export const CRITICAL_AVAILABILIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type AvailabilizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AvailabilizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AvailabilizabilityRolloutCheck[]
  guidance: string
}

export type AvailabilizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAvailabilizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateAvailabilizabilityRollout(
  input: AvailabilizabilityRolloutInput,
): AvailabilizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const availabilizabilityTableCoverageComplete =
    input.existingAvailabilizabilityTableCount === CRITICAL_AVAILABILIZABILITY_TABLES.length

  const checks: AvailabilizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL availabilizability checks can reach the database.'
            : 'Production availabilizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'availabilizability_signal_table_coverage',
      label: 'Availabilizability signal table coverage',
      status: availabilizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Availabilizability signal table coverage is only enforced in production.'
          : availabilizabilityTableCoverageComplete
            ? `${input.existingAvailabilizabilityTableCount}/${CRITICAL_AVAILABILIZABILITY_TABLES.length} availabilizability signal tables are present.`
            : `${input.existingAvailabilizabilityTableCount}/${CRITICAL_AVAILABILIZABILITY_TABLES.length} availabilizability signal tables were found.`,
    },
    {
      name: 'shield_scan_availabilizability',
      label: 'Shield scan availabilizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan availabilizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan availabilizability signals.'
            : 'Production availabilizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_availabilizability',
      label: 'Provider credential availabilizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential availabilizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential availabilizability signals.'
            : 'Production availabilizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'availabilization_readiness_signal',
      label: 'Availabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          availabilizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Availabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              availabilizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support availabilization readiness.'
            : 'Production availabilizability rollout requires PostgreSQL connectivity, availabilizability tables, shield scan availabilizability, provider credential availabilizability, and full signal coverage.',
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
        ? 'Production availabilizability rollout checks passed. Availabilizability coverage and availabilization readiness signal signals are healthy.'
        : 'Production availabilizability rollout is not ready. Resolve failed checks before relying on production availabilizability tooling.',
  }
}

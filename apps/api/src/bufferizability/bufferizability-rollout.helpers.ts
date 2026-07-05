import type { ApiEnv } from '../config/env.js'

export const CRITICAL_BUFFERIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type BufferizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type BufferizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: BufferizabilityRolloutCheck[]
  guidance: string
}

export type BufferizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingBufferizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateBufferizabilityRollout(
  input: BufferizabilityRolloutInput,
): BufferizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const bufferizabilityTableCoverageComplete =
    input.existingBufferizabilityTableCount === CRITICAL_BUFFERIZABILITY_TABLES.length

  const checks: BufferizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL bufferizability checks can reach the database.'
            : 'Production bufferizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'bufferizability_signal_table_coverage',
      label: 'Bufferizability signal table coverage',
      status: bufferizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Bufferizability signal table coverage is only enforced in production.'
          : bufferizabilityTableCoverageComplete
            ? `${input.existingBufferizabilityTableCount}/${CRITICAL_BUFFERIZABILITY_TABLES.length} bufferizability signal tables are present.`
            : `${input.existingBufferizabilityTableCount}/${CRITICAL_BUFFERIZABILITY_TABLES.length} bufferizability signal tables were found.`,
    },
    {
      name: 'shield_scan_bufferizability',
      label: 'Shield scan bufferizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan bufferizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan bufferizability signals.'
            : 'Production bufferizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_bufferizability',
      label: 'Provider credential bufferizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential bufferizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential bufferizability signals.'
            : 'Production bufferizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'bufferization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          bufferizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              bufferizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support bufferization readiness.'
            : 'Production bufferizability rollout requires PostgreSQL connectivity, bufferizability tables, shield scan bufferizability, provider credential bufferizability, and full signal coverage.',
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
        ? 'Production bufferizability rollout checks passed. Bufferizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production bufferizability rollout is not ready. Resolve failed checks before relying on production bufferizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CRYPTOGRAPHYIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type CryptographyizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CryptographyizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CryptographyizabilityRolloutCheck[]
  guidance: string
}

export type CryptographyizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCryptographyizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateCryptographyizabilityRollout(
  input: CryptographyizabilityRolloutInput,
): CryptographyizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const cryptographyizabilityTableCoverageComplete =
    input.existingCryptographyizabilityTableCount === CRITICAL_CRYPTOGRAPHYIZABILITY_TABLES.length

  const checks: CryptographyizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL cryptographyizability checks can reach the database.'
            : 'Production cryptographyizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'cryptographyizability_signal_table_coverage',
      label: 'Cryptographyizability signal table coverage',
      status: cryptographyizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Cryptographyizability signal table coverage is only enforced in production.'
          : cryptographyizabilityTableCoverageComplete
            ? `${input.existingCryptographyizabilityTableCount}/${CRITICAL_CRYPTOGRAPHYIZABILITY_TABLES.length} cryptographyizability signal tables are present.`
            : `${input.existingCryptographyizabilityTableCount}/${CRITICAL_CRYPTOGRAPHYIZABILITY_TABLES.length} cryptographyizability signal tables were found.`,
    },
    {
      name: 'shield_scan_cryptographyizability',
      label: 'Shield scan cryptographyizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan cryptographyizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan cryptographyizability signals.'
            : 'Production cryptographyizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_cryptographyizability',
      label: 'Provider credential cryptographyizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential cryptographyizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential cryptographyizability signals.'
            : 'Production cryptographyizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          cryptographyizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              cryptographyizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production cryptographyizability rollout requires PostgreSQL connectivity, cryptographyizability tables, shield scan cryptographyizability, provider credential cryptographyizability, and full signal coverage.',
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
        ? 'Production cryptographyizability rollout checks passed. Cryptographyizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production cryptographyizability rollout is not ready. Resolve failed checks before relying on production cryptographyizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_REGISTRARIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type RegistrarizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RegistrarizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RegistrarizabilityRolloutCheck[]
  guidance: string
}

export type RegistrarizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRegistrarizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateRegistrarizabilityRollout(
  input: RegistrarizabilityRolloutInput,
): RegistrarizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const registrarizabilityTableCoverageComplete =
    input.existingRegistrarizabilityTableCount === CRITICAL_REGISTRARIZABILITY_TABLES.length

  const checks: RegistrarizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL registrarizability checks can reach the database.'
            : 'Production registrarizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'registrarizability_signal_table_coverage',
      label: 'Registrarizability signal table coverage',
      status: registrarizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Registrarizability signal table coverage is only enforced in production.'
          : registrarizabilityTableCoverageComplete
            ? `${input.existingRegistrarizabilityTableCount}/${CRITICAL_REGISTRARIZABILITY_TABLES.length} registrarizability signal tables are present.`
            : `${input.existingRegistrarizabilityTableCount}/${CRITICAL_REGISTRARIZABILITY_TABLES.length} registrarizability signal tables were found.`,
    },
    {
      name: 'shield_scan_registrarizability',
      label: 'Shield scan registrarizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan registrarizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan registrarizability signals.'
            : 'Production registrarizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_registrarizability',
      label: 'Provider credential registrarizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential registrarizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential registrarizability signals.'
            : 'Production registrarizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          registrarizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              registrarizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production registrarizability rollout requires PostgreSQL connectivity, registrarizability tables, shield scan registrarizability, provider credential registrarizability, and full signal coverage.',
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
        ? 'Production registrarizability rollout checks passed. Registrarizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production registrarizability rollout is not ready. Resolve failed checks before relying on production registrarizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_LEDGERIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type LedgerizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type LedgerizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: LedgerizabilityRolloutCheck[]
  guidance: string
}

export type LedgerizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingLedgerizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateLedgerizabilityRollout(
  input: LedgerizabilityRolloutInput,
): LedgerizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const ledgerizabilityTableCoverageComplete =
    input.existingLedgerizabilityTableCount === CRITICAL_LEDGERIZABILITY_TABLES.length

  const checks: LedgerizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL ledgerizability checks can reach the database.'
            : 'Production ledgerizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'ledgerizability_signal_table_coverage',
      label: 'Ledgerizability signal table coverage',
      status: ledgerizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Ledgerizability signal table coverage is only enforced in production.'
          : ledgerizabilityTableCoverageComplete
            ? `${input.existingLedgerizabilityTableCount}/${CRITICAL_LEDGERIZABILITY_TABLES.length} ledgerizability signal tables are present.`
            : `${input.existingLedgerizabilityTableCount}/${CRITICAL_LEDGERIZABILITY_TABLES.length} ledgerizability signal tables were found.`,
    },
    {
      name: 'shield_scan_ledgerizability',
      label: 'Shield scan ledgerizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan ledgerizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan ledgerizability signals.'
            : 'Production ledgerizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_ledgerizability',
      label: 'Provider credential ledgerizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential ledgerizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential ledgerizability signals.'
            : 'Production ledgerizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          ledgerizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              ledgerizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production ledgerizability rollout requires PostgreSQL connectivity, ledgerizability tables, shield scan ledgerizability, provider credential ledgerizability, and full signal coverage.',
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
        ? 'Production ledgerizability rollout checks passed. Ledgerizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production ledgerizability rollout is not ready. Resolve failed checks before relying on production ledgerizability tooling.',
  }
}

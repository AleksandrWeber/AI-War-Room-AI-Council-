import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SCANNABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type ScannabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ScannabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ScannabilityRolloutCheck[]
  guidance: string
}

export type ScannabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingScannabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateScannabilityRollout(
  input: ScannabilityRolloutInput,
): ScannabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const scannabilityTableCoverageComplete =
    input.existingScannabilityTableCount === CRITICAL_SCANNABILITY_TABLES.length

  const checks: ScannabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL scannability checks can reach the database.'
            : 'Production scannability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'scannability_signal_table_coverage',
      label: 'Scannability signal table coverage',
      status: scannabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Scannability signal table coverage is only enforced in production.'
          : scannabilityTableCoverageComplete
            ? `${input.existingScannabilityTableCount}/${CRITICAL_SCANNABILITY_TABLES.length} scannability signal tables are present.`
            : `${input.existingScannabilityTableCount}/${CRITICAL_SCANNABILITY_TABLES.length} scannability signal tables were found.`,
    },
    {
      name: 'shield_scan_scannability',
      label: 'Shield scan scannability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan scannability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan scannability signals.'
            : 'Production scannability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_scannability',
      label: 'Provider credential scannability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential scannability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential scannability signals.'
            : 'Production scannability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'scanning_readiness_signal',
      label: 'Scanning readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          scannabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Scanning readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              scannabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support scanning readiness.'
            : 'Production scannability rollout requires PostgreSQL connectivity, scannability tables, shield scan scannability, provider credential scannability, and full signal coverage.',
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
        ? 'Production scannability rollout checks passed. Scannability coverage and scanning readiness signal signals are healthy.'
        : 'Production scannability rollout is not ready. Resolve failed checks before relying on production scannability tooling.',
  }
}

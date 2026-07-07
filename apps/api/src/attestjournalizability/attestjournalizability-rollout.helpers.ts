import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ATTESTJOURNALIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type AttestjournalizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AttestjournalizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AttestjournalizabilityRolloutCheck[]
  guidance: string
}

export type AttestjournalizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAttestjournalizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateAttestjournalizabilityRollout(
  input: AttestjournalizabilityRolloutInput,
): AttestjournalizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const attestjournalizabilityTableCoverageComplete =
    input.existingAttestjournalizabilityTableCount === CRITICAL_ATTESTJOURNALIZABILITY_TABLES.length

  const checks: AttestjournalizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL attestjournalizability checks can reach the database.'
            : 'Production attestjournalizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'attestjournalizability_signal_table_coverage',
      label: 'Attestjournalizability signal table coverage',
      status: attestjournalizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Attestjournalizability signal table coverage is only enforced in production.'
          : attestjournalizabilityTableCoverageComplete
            ? `${input.existingAttestjournalizabilityTableCount}/${CRITICAL_ATTESTJOURNALIZABILITY_TABLES.length} attestjournalizability signal tables are present.`
            : `${input.existingAttestjournalizabilityTableCount}/${CRITICAL_ATTESTJOURNALIZABILITY_TABLES.length} attestjournalizability signal tables were found.`,
    },
    {
      name: 'shield_scan_attestjournalizability',
      label: 'Shield scan attestjournalizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan attestjournalizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan attestjournalizability signals.'
            : 'Production attestjournalizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_attestjournalizability',
      label: 'Provider credential attestjournalizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential attestjournalizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential attestjournalizability signals.'
            : 'Production attestjournalizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          attestjournalizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              attestjournalizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production attestjournalizability rollout requires PostgreSQL connectivity, attestjournalizability tables, shield scan attestjournalizability, provider credential attestjournalizability, and full signal coverage.',
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
        ? 'Production attestjournalizability rollout checks passed. Attestjournalizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production attestjournalizability rollout is not ready. Resolve failed checks before relying on production attestjournalizability tooling.',
  }
}

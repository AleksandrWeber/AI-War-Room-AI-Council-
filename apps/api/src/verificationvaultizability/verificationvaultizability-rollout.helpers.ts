import type { ApiEnv } from '../config/env.js'

export const CRITICAL_VERIFICATIONVAULTIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type VerificationvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type VerificationvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: VerificationvaultizabilityRolloutCheck[]
  guidance: string
}

export type VerificationvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingVerificationvaultizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateVerificationvaultizabilityRollout(
  input: VerificationvaultizabilityRolloutInput,
): VerificationvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const verificationvaultizabilityTableCoverageComplete =
    input.existingVerificationvaultizabilityTableCount === CRITICAL_VERIFICATIONVAULTIZABILITY_TABLES.length

  const checks: VerificationvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL verificationvaultizability checks can reach the database.'
            : 'Production verificationvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'verificationvaultizability_signal_table_coverage',
      label: 'Verificationvaultizability signal table coverage',
      status: verificationvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Verificationvaultizability signal table coverage is only enforced in production.'
          : verificationvaultizabilityTableCoverageComplete
            ? `${input.existingVerificationvaultizabilityTableCount}/${CRITICAL_VERIFICATIONVAULTIZABILITY_TABLES.length} verificationvaultizability signal tables are present.`
            : `${input.existingVerificationvaultizabilityTableCount}/${CRITICAL_VERIFICATIONVAULTIZABILITY_TABLES.length} verificationvaultizability signal tables were found.`,
    },
    {
      name: 'shield_scan_verificationvaultizability',
      label: 'Shield scan verificationvaultizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan verificationvaultizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan verificationvaultizability signals.'
            : 'Production verificationvaultizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_verificationvaultizability',
      label: 'Provider credential verificationvaultizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential verificationvaultizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential verificationvaultizability signals.'
            : 'Production verificationvaultizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          verificationvaultizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              verificationvaultizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production verificationvaultizability rollout requires PostgreSQL connectivity, verificationvaultizability tables, shield scan verificationvaultizability, provider credential verificationvaultizability, and full signal coverage.',
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
        ? 'Production verificationvaultizability rollout checks passed. Verificationvaultizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production verificationvaultizability rollout is not ready. Resolve failed checks before relying on production verificationvaultizability tooling.',
  }
}

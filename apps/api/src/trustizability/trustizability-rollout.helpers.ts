import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TRUSTIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type TrustizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TrustizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TrustizabilityRolloutCheck[]
  guidance: string
}

export type TrustizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTrustizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateTrustizabilityRollout(
  input: TrustizabilityRolloutInput,
): TrustizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const trustizabilityTableCoverageComplete =
    input.existingTrustizabilityTableCount === CRITICAL_TRUSTIZABILITY_TABLES.length

  const checks: TrustizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL trustizability checks can reach the database.'
            : 'Production trustizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'trustizability_signal_table_coverage',
      label: 'Trustizability signal table coverage',
      status: trustizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Trustizability signal table coverage is only enforced in production.'
          : trustizabilityTableCoverageComplete
            ? `${input.existingTrustizabilityTableCount}/${CRITICAL_TRUSTIZABILITY_TABLES.length} trustizability signal tables are present.`
            : `${input.existingTrustizabilityTableCount}/${CRITICAL_TRUSTIZABILITY_TABLES.length} trustizability signal tables were found.`,
    },
    {
      name: 'shield_scan_trustizability',
      label: 'Shield scan trustizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan trustizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan trustizability signals.'
            : 'Production trustizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_trustizability',
      label: 'Provider credential trustizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential trustizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential trustizability signals.'
            : 'Production trustizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          trustizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              trustizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production trustizability rollout requires PostgreSQL connectivity, trustizability tables, shield scan trustizability, provider credential trustizability, and full signal coverage.',
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
        ? 'Production trustizability rollout checks passed. Trustizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production trustizability rollout is not ready. Resolve failed checks before relying on production trustizability tooling.',
  }
}

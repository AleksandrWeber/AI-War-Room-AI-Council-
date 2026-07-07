import type { ApiEnv } from '../config/env.js'

export const CRITICAL_AUDITVAULTIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type AuditvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AuditvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AuditvaultizabilityRolloutCheck[]
  guidance: string
}

export type AuditvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAuditvaultizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateAuditvaultizabilityRollout(
  input: AuditvaultizabilityRolloutInput,
): AuditvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const auditvaultizabilityTableCoverageComplete =
    input.existingAuditvaultizabilityTableCount === CRITICAL_AUDITVAULTIZABILITY_TABLES.length

  const checks: AuditvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL auditvaultizability checks can reach the database.'
            : 'Production auditvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'auditvaultizability_signal_table_coverage',
      label: 'Auditvaultizability signal table coverage',
      status: auditvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Auditvaultizability signal table coverage is only enforced in production.'
          : auditvaultizabilityTableCoverageComplete
            ? `${input.existingAuditvaultizabilityTableCount}/${CRITICAL_AUDITVAULTIZABILITY_TABLES.length} auditvaultizability signal tables are present.`
            : `${input.existingAuditvaultizabilityTableCount}/${CRITICAL_AUDITVAULTIZABILITY_TABLES.length} auditvaultizability signal tables were found.`,
    },
    {
      name: 'shield_scan_auditvaultizability',
      label: 'Shield scan auditvaultizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan auditvaultizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan auditvaultizability signals.'
            : 'Production auditvaultizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_auditvaultizability',
      label: 'Provider credential auditvaultizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential auditvaultizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential auditvaultizability signals.'
            : 'Production auditvaultizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          auditvaultizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              auditvaultizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production auditvaultizability rollout requires PostgreSQL connectivity, auditvaultizability tables, shield scan auditvaultizability, provider credential auditvaultizability, and full signal coverage.',
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
        ? 'Production auditvaultizability rollout checks passed. Auditvaultizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production auditvaultizability rollout is not ready. Resolve failed checks before relying on production auditvaultizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SEARCHIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type SearchizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SearchizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SearchizabilityRolloutCheck[]
  guidance: string
}

export type SearchizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSearchizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateSearchizabilityRollout(
  input: SearchizabilityRolloutInput,
): SearchizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const searchizabilityTableCoverageComplete =
    input.existingSearchizabilityTableCount === CRITICAL_SEARCHIZABILITY_TABLES.length

  const checks: SearchizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL searchizability checks can reach the database.'
            : 'Production searchizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'searchizability_signal_table_coverage',
      label: 'Searchizability signal table coverage',
      status: searchizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Searchizability signal table coverage is only enforced in production.'
          : searchizabilityTableCoverageComplete
            ? `${input.existingSearchizabilityTableCount}/${CRITICAL_SEARCHIZABILITY_TABLES.length} searchizability signal tables are present.`
            : `${input.existingSearchizabilityTableCount}/${CRITICAL_SEARCHIZABILITY_TABLES.length} searchizability signal tables were found.`,
    },
    {
      name: 'shield_scan_searchizability',
      label: 'Shield scan searchizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan searchizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan searchizability signals.'
            : 'Production searchizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_searchizability',
      label: 'Provider credential searchizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential searchizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential searchizability signals.'
            : 'Production searchizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'searchization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          searchizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              searchizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support searchization readiness.'
            : 'Production searchizability rollout requires PostgreSQL connectivity, searchizability tables, shield scan searchizability, provider credential searchizability, and full signal coverage.',
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
        ? 'Production searchizability rollout checks passed. Searchizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production searchizability rollout is not ready. Resolve failed checks before relying on production searchizability tooling.',
  }
}

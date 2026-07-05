import type { ApiEnv } from '../config/env.js'

export const CRITICAL_EPISTEMIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type EpistemizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type EpistemizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: EpistemizabilityRolloutCheck[]
  guidance: string
}

export type EpistemizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingEpistemizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateEpistemizabilityRollout(
  input: EpistemizabilityRolloutInput,
): EpistemizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const epistemizabilityTableCoverageComplete =
    input.existingEpistemizabilityTableCount === CRITICAL_EPISTEMIZABILITY_TABLES.length

  const checks: EpistemizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL epistemizability checks can reach the database.'
            : 'Production epistemizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'epistemizability_signal_table_coverage',
      label: 'Epistemizability signal table coverage',
      status: epistemizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Epistemizability signal table coverage is only enforced in production.'
          : epistemizabilityTableCoverageComplete
            ? `${input.existingEpistemizabilityTableCount}/${CRITICAL_EPISTEMIZABILITY_TABLES.length} epistemizability signal tables are present.`
            : `${input.existingEpistemizabilityTableCount}/${CRITICAL_EPISTEMIZABILITY_TABLES.length} epistemizability signal tables were found.`,
    },
    {
      name: 'shield_scan_epistemizability',
      label: 'Shield scan epistemizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan epistemizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan epistemizability signals.'
            : 'Production epistemizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_epistemizability',
      label: 'Provider credential epistemizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential epistemizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential epistemizability signals.'
            : 'Production epistemizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'epistemization_readiness_signal',
      label: 'Epistemization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          epistemizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Epistemization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              epistemizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support epistemization readiness.'
            : 'Production epistemizability rollout requires PostgreSQL connectivity, epistemizability tables, shield scan epistemizability, provider credential epistemizability, and full signal coverage.',
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
        ? 'Production epistemizability rollout checks passed. Epistemizability coverage and epistemization readiness signal signals are healthy.'
        : 'Production epistemizability rollout is not ready. Resolve failed checks before relying on production epistemizability tooling.',
  }
}

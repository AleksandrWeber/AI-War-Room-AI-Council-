import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ILLUSTRATABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type IllustratabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type IllustratabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: IllustratabilityRolloutCheck[]
  guidance: string
}

export type IllustratabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingIllustratabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateIllustratabilityRollout(
  input: IllustratabilityRolloutInput,
): IllustratabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const illustratabilityTableCoverageComplete =
    input.existingIllustratabilityTableCount === CRITICAL_ILLUSTRATABILITY_TABLES.length

  const checks: IllustratabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL illustratability checks can reach the database.'
            : 'Production illustratability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'illustratability_signal_table_coverage',
      label: 'Illustratability signal table coverage',
      status: illustratabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Illustratability signal table coverage is only enforced in production.'
          : illustratabilityTableCoverageComplete
            ? `${input.existingIllustratabilityTableCount}/${CRITICAL_ILLUSTRATABILITY_TABLES.length} illustratability signal tables are present.`
            : `${input.existingIllustratabilityTableCount}/${CRITICAL_ILLUSTRATABILITY_TABLES.length} illustratability signal tables were found.`,
    },
    {
      name: 'shield_scan_illustratability',
      label: 'Shield scan illustratability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan illustratability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan illustratability signals.'
            : 'Production illustratability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_illustratability',
      label: 'Provider credential illustratability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential illustratability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential illustratability signals.'
            : 'Production illustratability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'illustration_readiness_signal',
      label: 'Illustration readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          illustratabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Illustration readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              illustratabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support illustration readiness.'
            : 'Production illustratability rollout requires PostgreSQL connectivity, illustratability tables, shield scan illustratability, provider credential illustratability, and full signal coverage.',
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
        ? 'Production illustratability rollout checks passed. Illustratability coverage and illustration readiness signal signals are healthy.'
        : 'Production illustratability rollout is not ready. Resolve failed checks before relying on production illustratability tooling.',
  }
}

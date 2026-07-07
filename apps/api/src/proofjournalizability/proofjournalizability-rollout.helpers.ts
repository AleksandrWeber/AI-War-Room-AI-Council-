import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PROOFJOURNALIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type ProofjournalizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ProofjournalizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ProofjournalizabilityRolloutCheck[]
  guidance: string
}

export type ProofjournalizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingProofjournalizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateProofjournalizabilityRollout(
  input: ProofjournalizabilityRolloutInput,
): ProofjournalizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const proofjournalizabilityTableCoverageComplete =
    input.existingProofjournalizabilityTableCount === CRITICAL_PROOFJOURNALIZABILITY_TABLES.length

  const checks: ProofjournalizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL proofjournalizability checks can reach the database.'
            : 'Production proofjournalizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'proofjournalizability_signal_table_coverage',
      label: 'Proofjournalizability signal table coverage',
      status: proofjournalizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Proofjournalizability signal table coverage is only enforced in production.'
          : proofjournalizabilityTableCoverageComplete
            ? `${input.existingProofjournalizabilityTableCount}/${CRITICAL_PROOFJOURNALIZABILITY_TABLES.length} proofjournalizability signal tables are present.`
            : `${input.existingProofjournalizabilityTableCount}/${CRITICAL_PROOFJOURNALIZABILITY_TABLES.length} proofjournalizability signal tables were found.`,
    },
    {
      name: 'shield_scan_proofjournalizability',
      label: 'Shield scan proofjournalizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan proofjournalizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan proofjournalizability signals.'
            : 'Production proofjournalizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_proofjournalizability',
      label: 'Provider credential proofjournalizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential proofjournalizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential proofjournalizability signals.'
            : 'Production proofjournalizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          proofjournalizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              proofjournalizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production proofjournalizability rollout requires PostgreSQL connectivity, proofjournalizability tables, shield scan proofjournalizability, provider credential proofjournalizability, and full signal coverage.',
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
        ? 'Production proofjournalizability rollout checks passed. Proofjournalizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production proofjournalizability rollout is not ready. Resolve failed checks before relying on production proofjournalizability tooling.',
  }
}

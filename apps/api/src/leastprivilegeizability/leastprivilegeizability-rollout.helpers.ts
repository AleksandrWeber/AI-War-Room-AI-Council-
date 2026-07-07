import type { ApiEnv } from '../config/env.js'

export const CRITICAL_LEASTPRIVILEGEIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type LeastprivilegeizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type LeastprivilegeizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: LeastprivilegeizabilityRolloutCheck[]
  guidance: string
}

export type LeastprivilegeizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingLeastprivilegeizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateLeastprivilegeizabilityRollout(
  input: LeastprivilegeizabilityRolloutInput,
): LeastprivilegeizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const leastprivilegeizabilityTableCoverageComplete =
    input.existingLeastprivilegeizabilityTableCount === CRITICAL_LEASTPRIVILEGEIZABILITY_TABLES.length

  const checks: LeastprivilegeizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL leastprivilegeizability checks can reach the database.'
            : 'Production leastprivilegeizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'leastprivilegeizability_signal_table_coverage',
      label: 'Leastprivilegeizability signal table coverage',
      status: leastprivilegeizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Leastprivilegeizability signal table coverage is only enforced in production.'
          : leastprivilegeizabilityTableCoverageComplete
            ? `${input.existingLeastprivilegeizabilityTableCount}/${CRITICAL_LEASTPRIVILEGEIZABILITY_TABLES.length} leastprivilegeizability signal tables are present.`
            : `${input.existingLeastprivilegeizabilityTableCount}/${CRITICAL_LEASTPRIVILEGEIZABILITY_TABLES.length} leastprivilegeizability signal tables were found.`,
    },
    {
      name: 'shield_scan_leastprivilegeizability',
      label: 'Shield scan leastprivilegeizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan leastprivilegeizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan leastprivilegeizability signals.'
            : 'Production leastprivilegeizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_leastprivilegeizability',
      label: 'Provider credential leastprivilegeizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential leastprivilegeizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential leastprivilegeizability signals.'
            : 'Production leastprivilegeizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          leastprivilegeizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              leastprivilegeizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production leastprivilegeizability rollout requires PostgreSQL connectivity, leastprivilegeizability tables, shield scan leastprivilegeizability, provider credential leastprivilegeizability, and full signal coverage.',
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
        ? 'Production leastprivilegeizability rollout checks passed. Leastprivilegeizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production leastprivilegeizability rollout is not ready. Resolve failed checks before relying on production leastprivilegeizability tooling.',
  }
}

import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ICONIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type IconizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type IconizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: IconizabilityRolloutCheck[]
  guidance: string
}

export type IconizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingIconizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateIconizabilityRollout(
  input: IconizabilityRolloutInput,
): IconizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const iconizabilityTableCoverageComplete =
    input.existingIconizabilityTableCount === CRITICAL_ICONIZABILITY_TABLES.length

  const checks: IconizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL iconizability checks can reach the database.'
            : 'Production iconizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'iconizability_signal_table_coverage',
      label: 'Iconizability signal table coverage',
      status: iconizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Iconizability signal table coverage is only enforced in production.'
          : iconizabilityTableCoverageComplete
            ? `${input.existingIconizabilityTableCount}/${CRITICAL_ICONIZABILITY_TABLES.length} iconizability signal tables are present.`
            : `${input.existingIconizabilityTableCount}/${CRITICAL_ICONIZABILITY_TABLES.length} iconizability signal tables were found.`,
    },
    {
      name: 'shield_scan_iconizability',
      label: 'Shield scan iconizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan iconizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan iconizability signals.'
            : 'Production iconizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_iconizability',
      label: 'Provider credential iconizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential iconizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential iconizability signals.'
            : 'Production iconizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'iconization_readiness_signal',
      label: 'Iconization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          iconizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Iconization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              iconizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support iconization readiness.'
            : 'Production iconizability rollout requires PostgreSQL connectivity, iconizability tables, shield scan iconizability, provider credential iconizability, and full signal coverage.',
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
        ? 'Production iconizability rollout checks passed. Iconizability coverage and iconization readiness signal signals are healthy.'
        : 'Production iconizability rollout is not ready. Resolve failed checks before relying on production iconizability tooling.',
  }
}

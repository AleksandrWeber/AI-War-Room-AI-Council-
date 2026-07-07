import type { ApiEnv } from '../config/env.js'

export const CRITICAL_COMPOSABILITYVAULTIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type ComposabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ComposabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ComposabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type ComposabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingComposabilityvaultizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateComposabilityvaultizabilityRollout(
  input: ComposabilityvaultizabilityRolloutInput,
): ComposabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const composabilityvaultizabilityTableCoverageComplete =
    input.existingComposabilityvaultizabilityTableCount === CRITICAL_COMPOSABILITYVAULTIZABILITY_TABLES.length

  const checks: ComposabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL composabilityvaultizability checks can reach the database.'
            : 'Production composabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'composabilityvaultizability_signal_table_coverage',
      label: 'Composabilityvaultizability signal table coverage',
      status: composabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Composabilityvaultizability signal table coverage is only enforced in production.'
          : composabilityvaultizabilityTableCoverageComplete
            ? `${input.existingComposabilityvaultizabilityTableCount}/${CRITICAL_COMPOSABILITYVAULTIZABILITY_TABLES.length} composabilityvaultizability signal tables are present.`
            : `${input.existingComposabilityvaultizabilityTableCount}/${CRITICAL_COMPOSABILITYVAULTIZABILITY_TABLES.length} composabilityvaultizability signal tables were found.`,
    },
    {
      name: 'shield_scan_composabilityvaultizability',
      label: 'Shield scan composabilityvaultizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan composabilityvaultizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan composabilityvaultizability signals.'
            : 'Production composabilityvaultizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_composabilityvaultizability',
      label: 'Provider credential composabilityvaultizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential composabilityvaultizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential composabilityvaultizability signals.'
            : 'Production composabilityvaultizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          composabilityvaultizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              composabilityvaultizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production composabilityvaultizability rollout requires PostgreSQL connectivity, composabilityvaultizability tables, shield scan composabilityvaultizability, provider credential composabilityvaultizability, and full signal coverage.',
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
        ? 'Production composabilityvaultizability rollout checks passed. Composabilityvaultizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production composabilityvaultizability rollout is not ready. Resolve failed checks before relying on production composabilityvaultizability tooling.',
  }
}

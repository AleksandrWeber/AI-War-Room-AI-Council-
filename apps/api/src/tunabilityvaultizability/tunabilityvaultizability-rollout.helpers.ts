import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TUNABILITYVAULTIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type TunabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TunabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TunabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type TunabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTunabilityvaultizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateTunabilityvaultizabilityRollout(
  input: TunabilityvaultizabilityRolloutInput,
): TunabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const tunabilityvaultizabilityTableCoverageComplete =
    input.existingTunabilityvaultizabilityTableCount === CRITICAL_TUNABILITYVAULTIZABILITY_TABLES.length

  const checks: TunabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL tunabilityvaultizability checks can reach the database.'
            : 'Production tunabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'tunabilityvaultizability_signal_table_coverage',
      label: 'Tunabilityvaultizability signal table coverage',
      status: tunabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Tunabilityvaultizability signal table coverage is only enforced in production.'
          : tunabilityvaultizabilityTableCoverageComplete
            ? `${input.existingTunabilityvaultizabilityTableCount}/${CRITICAL_TUNABILITYVAULTIZABILITY_TABLES.length} tunabilityvaultizability signal tables are present.`
            : `${input.existingTunabilityvaultizabilityTableCount}/${CRITICAL_TUNABILITYVAULTIZABILITY_TABLES.length} tunabilityvaultizability signal tables were found.`,
    },
    {
      name: 'shield_scan_tunabilityvaultizability',
      label: 'Shield scan tunabilityvaultizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan tunabilityvaultizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan tunabilityvaultizability signals.'
            : 'Production tunabilityvaultizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_tunabilityvaultizability',
      label: 'Provider credential tunabilityvaultizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential tunabilityvaultizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential tunabilityvaultizability signals.'
            : 'Production tunabilityvaultizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          tunabilityvaultizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              tunabilityvaultizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production tunabilityvaultizability rollout requires PostgreSQL connectivity, tunabilityvaultizability tables, shield scan tunabilityvaultizability, provider credential tunabilityvaultizability, and full signal coverage.',
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
        ? 'Production tunabilityvaultizability rollout checks passed. Tunabilityvaultizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production tunabilityvaultizability rollout is not ready. Resolve failed checks before relying on production tunabilityvaultizability tooling.',
  }
}

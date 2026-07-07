import type { ApiEnv } from '../config/env.js'

export const CRITICAL_EXTENSIBILITYVAULTIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type ExtensibilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ExtensibilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ExtensibilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type ExtensibilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingExtensibilityvaultizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateExtensibilityvaultizabilityRollout(
  input: ExtensibilityvaultizabilityRolloutInput,
): ExtensibilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const extensibilityvaultizabilityTableCoverageComplete =
    input.existingExtensibilityvaultizabilityTableCount === CRITICAL_EXTENSIBILITYVAULTIZABILITY_TABLES.length

  const checks: ExtensibilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL extensibilityvaultizability checks can reach the database.'
            : 'Production extensibilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'extensibilityvaultizability_signal_table_coverage',
      label: 'Extensibilityvaultizability signal table coverage',
      status: extensibilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Extensibilityvaultizability signal table coverage is only enforced in production.'
          : extensibilityvaultizabilityTableCoverageComplete
            ? `${input.existingExtensibilityvaultizabilityTableCount}/${CRITICAL_EXTENSIBILITYVAULTIZABILITY_TABLES.length} extensibilityvaultizability signal tables are present.`
            : `${input.existingExtensibilityvaultizabilityTableCount}/${CRITICAL_EXTENSIBILITYVAULTIZABILITY_TABLES.length} extensibilityvaultizability signal tables were found.`,
    },
    {
      name: 'shield_scan_extensibilityvaultizability',
      label: 'Shield scan extensibilityvaultizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan extensibilityvaultizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan extensibilityvaultizability signals.'
            : 'Production extensibilityvaultizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_extensibilityvaultizability',
      label: 'Provider credential extensibilityvaultizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential extensibilityvaultizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential extensibilityvaultizability signals.'
            : 'Production extensibilityvaultizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          extensibilityvaultizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              extensibilityvaultizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production extensibilityvaultizability rollout requires PostgreSQL connectivity, extensibilityvaultizability tables, shield scan extensibilityvaultizability, provider credential extensibilityvaultizability, and full signal coverage.',
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
        ? 'Production extensibilityvaultizability rollout checks passed. Extensibilityvaultizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production extensibilityvaultizability rollout is not ready. Resolve failed checks before relying on production extensibilityvaultizability tooling.',
  }
}

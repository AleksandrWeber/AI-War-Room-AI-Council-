import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DISCOVERABILITYVAULTIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type DiscoverabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DiscoverabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DiscoverabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type DiscoverabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDiscoverabilityvaultizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateDiscoverabilityvaultizabilityRollout(
  input: DiscoverabilityvaultizabilityRolloutInput,
): DiscoverabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const discoverabilityvaultizabilityTableCoverageComplete =
    input.existingDiscoverabilityvaultizabilityTableCount === CRITICAL_DISCOVERABILITYVAULTIZABILITY_TABLES.length

  const checks: DiscoverabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL discoverabilityvaultizability checks can reach the database.'
            : 'Production discoverabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'discoverabilityvaultizability_signal_table_coverage',
      label: 'Discoverabilityvaultizability signal table coverage',
      status: discoverabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Discoverabilityvaultizability signal table coverage is only enforced in production.'
          : discoverabilityvaultizabilityTableCoverageComplete
            ? `${input.existingDiscoverabilityvaultizabilityTableCount}/${CRITICAL_DISCOVERABILITYVAULTIZABILITY_TABLES.length} discoverabilityvaultizability signal tables are present.`
            : `${input.existingDiscoverabilityvaultizabilityTableCount}/${CRITICAL_DISCOVERABILITYVAULTIZABILITY_TABLES.length} discoverabilityvaultizability signal tables were found.`,
    },
    {
      name: 'shield_scan_discoverabilityvaultizability',
      label: 'Shield scan discoverabilityvaultizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan discoverabilityvaultizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan discoverabilityvaultizability signals.'
            : 'Production discoverabilityvaultizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_discoverabilityvaultizability',
      label: 'Provider credential discoverabilityvaultizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential discoverabilityvaultizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential discoverabilityvaultizability signals.'
            : 'Production discoverabilityvaultizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          discoverabilityvaultizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              discoverabilityvaultizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production discoverabilityvaultizability rollout requires PostgreSQL connectivity, discoverabilityvaultizability tables, shield scan discoverabilityvaultizability, provider credential discoverabilityvaultizability, and full signal coverage.',
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
        ? 'Production discoverabilityvaultizability rollout checks passed. Discoverabilityvaultizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production discoverabilityvaultizability rollout is not ready. Resolve failed checks before relying on production discoverabilityvaultizability tooling.',
  }
}

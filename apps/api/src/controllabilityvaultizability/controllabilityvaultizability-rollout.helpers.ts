import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CONTROLLABILITYVAULTIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type ControllabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ControllabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ControllabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type ControllabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingControllabilityvaultizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateControllabilityvaultizabilityRollout(
  input: ControllabilityvaultizabilityRolloutInput,
): ControllabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const controllabilityvaultizabilityTableCoverageComplete =
    input.existingControllabilityvaultizabilityTableCount === CRITICAL_CONTROLLABILITYVAULTIZABILITY_TABLES.length

  const checks: ControllabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL controllabilityvaultizability checks can reach the database.'
            : 'Production controllabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'controllabilityvaultizability_signal_table_coverage',
      label: 'Controllabilityvaultizability signal table coverage',
      status: controllabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Controllabilityvaultizability signal table coverage is only enforced in production.'
          : controllabilityvaultizabilityTableCoverageComplete
            ? `${input.existingControllabilityvaultizabilityTableCount}/${CRITICAL_CONTROLLABILITYVAULTIZABILITY_TABLES.length} controllabilityvaultizability signal tables are present.`
            : `${input.existingControllabilityvaultizabilityTableCount}/${CRITICAL_CONTROLLABILITYVAULTIZABILITY_TABLES.length} controllabilityvaultizability signal tables were found.`,
    },
    {
      name: 'shield_scan_controllabilityvaultizability',
      label: 'Shield scan controllabilityvaultizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan controllabilityvaultizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan controllabilityvaultizability signals.'
            : 'Production controllabilityvaultizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_controllabilityvaultizability',
      label: 'Provider credential controllabilityvaultizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential controllabilityvaultizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential controllabilityvaultizability signals.'
            : 'Production controllabilityvaultizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          controllabilityvaultizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              controllabilityvaultizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production controllabilityvaultizability rollout requires PostgreSQL connectivity, controllabilityvaultizability tables, shield scan controllabilityvaultizability, provider credential controllabilityvaultizability, and full signal coverage.',
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
        ? 'Production controllabilityvaultizability rollout checks passed. Controllabilityvaultizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production controllabilityvaultizability rollout is not ready. Resolve failed checks before relying on production controllabilityvaultizability tooling.',
  }
}

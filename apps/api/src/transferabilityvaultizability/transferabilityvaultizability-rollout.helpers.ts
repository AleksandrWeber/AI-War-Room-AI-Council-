import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TRANSFERABILITYVAULTIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type TransferabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TransferabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TransferabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type TransferabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTransferabilityvaultizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateTransferabilityvaultizabilityRollout(
  input: TransferabilityvaultizabilityRolloutInput,
): TransferabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const transferabilityvaultizabilityTableCoverageComplete =
    input.existingTransferabilityvaultizabilityTableCount === CRITICAL_TRANSFERABILITYVAULTIZABILITY_TABLES.length

  const checks: TransferabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL transferabilityvaultizability checks can reach the database.'
            : 'Production transferabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'transferabilityvaultizability_signal_table_coverage',
      label: 'Transferabilityvaultizability signal table coverage',
      status: transferabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Transferabilityvaultizability signal table coverage is only enforced in production.'
          : transferabilityvaultizabilityTableCoverageComplete
            ? `${input.existingTransferabilityvaultizabilityTableCount}/${CRITICAL_TRANSFERABILITYVAULTIZABILITY_TABLES.length} transferabilityvaultizability signal tables are present.`
            : `${input.existingTransferabilityvaultizabilityTableCount}/${CRITICAL_TRANSFERABILITYVAULTIZABILITY_TABLES.length} transferabilityvaultizability signal tables were found.`,
    },
    {
      name: 'shield_scan_transferabilityvaultizability',
      label: 'Shield scan transferabilityvaultizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan transferabilityvaultizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan transferabilityvaultizability signals.'
            : 'Production transferabilityvaultizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_transferabilityvaultizability',
      label: 'Provider credential transferabilityvaultizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential transferabilityvaultizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential transferabilityvaultizability signals.'
            : 'Production transferabilityvaultizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          transferabilityvaultizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              transferabilityvaultizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production transferabilityvaultizability rollout requires PostgreSQL connectivity, transferabilityvaultizability tables, shield scan transferabilityvaultizability, provider credential transferabilityvaultizability, and full signal coverage.',
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
        ? 'Production transferabilityvaultizability rollout checks passed. Transferabilityvaultizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production transferabilityvaultizability rollout is not ready. Resolve failed checks before relying on production transferabilityvaultizability tooling.',
  }
}

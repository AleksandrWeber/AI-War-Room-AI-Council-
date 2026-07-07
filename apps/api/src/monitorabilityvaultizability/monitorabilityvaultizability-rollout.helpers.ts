import type { ApiEnv } from '../config/env.js'

export const CRITICAL_MONITORABILITYVAULTIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type MonitorabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type MonitorabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: MonitorabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type MonitorabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingMonitorabilityvaultizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateMonitorabilityvaultizabilityRollout(
  input: MonitorabilityvaultizabilityRolloutInput,
): MonitorabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const monitorabilityvaultizabilityTableCoverageComplete =
    input.existingMonitorabilityvaultizabilityTableCount === CRITICAL_MONITORABILITYVAULTIZABILITY_TABLES.length

  const checks: MonitorabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL monitorabilityvaultizability checks can reach the database.'
            : 'Production monitorabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'monitorabilityvaultizability_signal_table_coverage',
      label: 'Monitorabilityvaultizability signal table coverage',
      status: monitorabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Monitorabilityvaultizability signal table coverage is only enforced in production.'
          : monitorabilityvaultizabilityTableCoverageComplete
            ? `${input.existingMonitorabilityvaultizabilityTableCount}/${CRITICAL_MONITORABILITYVAULTIZABILITY_TABLES.length} monitorabilityvaultizability signal tables are present.`
            : `${input.existingMonitorabilityvaultizabilityTableCount}/${CRITICAL_MONITORABILITYVAULTIZABILITY_TABLES.length} monitorabilityvaultizability signal tables were found.`,
    },
    {
      name: 'shield_scan_monitorabilityvaultizability',
      label: 'Shield scan monitorabilityvaultizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan monitorabilityvaultizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan monitorabilityvaultizability signals.'
            : 'Production monitorabilityvaultizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_monitorabilityvaultizability',
      label: 'Provider credential monitorabilityvaultizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential monitorabilityvaultizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential monitorabilityvaultizability signals.'
            : 'Production monitorabilityvaultizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          monitorabilityvaultizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              monitorabilityvaultizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production monitorabilityvaultizability rollout requires PostgreSQL connectivity, monitorabilityvaultizability tables, shield scan monitorabilityvaultizability, provider credential monitorabilityvaultizability, and full signal coverage.',
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
        ? 'Production monitorabilityvaultizability rollout checks passed. Monitorabilityvaultizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production monitorabilityvaultizability rollout is not ready. Resolve failed checks before relying on production monitorabilityvaultizability tooling.',
  }
}

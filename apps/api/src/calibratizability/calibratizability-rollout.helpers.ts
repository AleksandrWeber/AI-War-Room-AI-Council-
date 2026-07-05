import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CALIBRATIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type CalibratizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CalibratizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CalibratizabilityRolloutCheck[]
  guidance: string
}

export type CalibratizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCalibratizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateCalibratizabilityRollout(
  input: CalibratizabilityRolloutInput,
): CalibratizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const calibratizabilityTableCoverageComplete =
    input.existingCalibratizabilityTableCount === CRITICAL_CALIBRATIZABILITY_TABLES.length

  const checks: CalibratizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL calibratizability checks can reach the database.'
            : 'Production calibratizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'calibratizability_signal_table_coverage',
      label: 'Calibratizability signal table coverage',
      status: calibratizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Calibratizability signal table coverage is only enforced in production.'
          : calibratizabilityTableCoverageComplete
            ? `${input.existingCalibratizabilityTableCount}/${CRITICAL_CALIBRATIZABILITY_TABLES.length} calibratizability signal tables are present.`
            : `${input.existingCalibratizabilityTableCount}/${CRITICAL_CALIBRATIZABILITY_TABLES.length} calibratizability signal tables were found.`,
    },
    {
      name: 'shield_scan_calibratizability',
      label: 'Shield scan calibratizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan calibratizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan calibratizability signals.'
            : 'Production calibratizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_calibratizability',
      label: 'Provider credential calibratizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential calibratizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential calibratizability signals.'
            : 'Production calibratizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'calibratization_readiness_signal',
      label: 'Calibratization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          calibratizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Calibratization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              calibratizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support calibratization readiness.'
            : 'Production calibratizability rollout requires PostgreSQL connectivity, calibratizability tables, shield scan calibratizability, provider credential calibratizability, and full signal coverage.',
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
        ? 'Production calibratizability rollout checks passed. Calibratizability coverage and calibratization readiness signal signals are healthy.'
        : 'Production calibratizability rollout is not ready. Resolve failed checks before relying on production calibratizability tooling.',
  }
}

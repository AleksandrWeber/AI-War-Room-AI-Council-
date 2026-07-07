import type { ApiEnv } from '../config/env.js'

export const CRITICAL_INSTRUMENTATIONIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type InstrumentationizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type InstrumentationizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: InstrumentationizabilityRolloutCheck[]
  guidance: string
}

export type InstrumentationizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingInstrumentationizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateInstrumentationizabilityRollout(
  input: InstrumentationizabilityRolloutInput,
): InstrumentationizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const instrumentationizabilityTableCoverageComplete =
    input.existingInstrumentationizabilityTableCount === CRITICAL_INSTRUMENTATIONIZABILITY_TABLES.length

  const checks: InstrumentationizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL instrumentationizability checks can reach the database.'
            : 'Production instrumentationizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'instrumentationizability_signal_table_coverage',
      label: 'Instrumentationizability signal table coverage',
      status: instrumentationizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Instrumentationizability signal table coverage is only enforced in production.'
          : instrumentationizabilityTableCoverageComplete
            ? `${input.existingInstrumentationizabilityTableCount}/${CRITICAL_INSTRUMENTATIONIZABILITY_TABLES.length} instrumentationizability signal tables are present.`
            : `${input.existingInstrumentationizabilityTableCount}/${CRITICAL_INSTRUMENTATIONIZABILITY_TABLES.length} instrumentationizability signal tables were found.`,
    },
    {
      name: 'shield_scan_instrumentationizability',
      label: 'Shield scan instrumentationizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan instrumentationizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan instrumentationizability signals.'
            : 'Production instrumentationizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_instrumentationizability',
      label: 'Provider credential instrumentationizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential instrumentationizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential instrumentationizability signals.'
            : 'Production instrumentationizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          instrumentationizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              instrumentationizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production instrumentationizability rollout requires PostgreSQL connectivity, instrumentationizability tables, shield scan instrumentationizability, provider credential instrumentationizability, and full signal coverage.',
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
        ? 'Production instrumentationizability rollout checks passed. Instrumentationizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production instrumentationizability rollout is not ready. Resolve failed checks before relying on production instrumentationizability tooling.',
  }
}

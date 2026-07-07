import type { ApiEnv } from '../config/env.js'

export const CRITICAL_JUSTIFIABILITYVAULTIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type JustifiabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type JustifiabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: JustifiabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type JustifiabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingJustifiabilityvaultizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateJustifiabilityvaultizabilityRollout(
  input: JustifiabilityvaultizabilityRolloutInput,
): JustifiabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const justifiabilityvaultizabilityTableCoverageComplete =
    input.existingJustifiabilityvaultizabilityTableCount === CRITICAL_JUSTIFIABILITYVAULTIZABILITY_TABLES.length

  const checks: JustifiabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL justifiabilityvaultizability checks can reach the database.'
            : 'Production justifiabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'justifiabilityvaultizability_signal_table_coverage',
      label: 'Justifiabilityvaultizability signal table coverage',
      status: justifiabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Justifiabilityvaultizability signal table coverage is only enforced in production.'
          : justifiabilityvaultizabilityTableCoverageComplete
            ? `${input.existingJustifiabilityvaultizabilityTableCount}/${CRITICAL_JUSTIFIABILITYVAULTIZABILITY_TABLES.length} justifiabilityvaultizability signal tables are present.`
            : `${input.existingJustifiabilityvaultizabilityTableCount}/${CRITICAL_JUSTIFIABILITYVAULTIZABILITY_TABLES.length} justifiabilityvaultizability signal tables were found.`,
    },
    {
      name: 'shield_scan_justifiabilityvaultizability',
      label: 'Shield scan justifiabilityvaultizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan justifiabilityvaultizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan justifiabilityvaultizability signals.'
            : 'Production justifiabilityvaultizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_justifiabilityvaultizability',
      label: 'Provider credential justifiabilityvaultizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential justifiabilityvaultizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential justifiabilityvaultizability signals.'
            : 'Production justifiabilityvaultizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          justifiabilityvaultizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              justifiabilityvaultizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production justifiabilityvaultizability rollout requires PostgreSQL connectivity, justifiabilityvaultizability tables, shield scan justifiabilityvaultizability, provider credential justifiabilityvaultizability, and full signal coverage.',
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
        ? 'Production justifiabilityvaultizability rollout checks passed. Justifiabilityvaultizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production justifiabilityvaultizability rollout is not ready. Resolve failed checks before relying on production justifiabilityvaultizability tooling.',
  }
}

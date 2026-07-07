import type { ApiEnv } from '../config/env.js'

export const CRITICAL_REPRODUCIBILITYVAULTIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type ReproducibilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ReproducibilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ReproducibilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type ReproducibilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingReproducibilityvaultizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateReproducibilityvaultizabilityRollout(
  input: ReproducibilityvaultizabilityRolloutInput,
): ReproducibilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const reproducibilityvaultizabilityTableCoverageComplete =
    input.existingReproducibilityvaultizabilityTableCount === CRITICAL_REPRODUCIBILITYVAULTIZABILITY_TABLES.length

  const checks: ReproducibilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL reproducibilityvaultizability checks can reach the database.'
            : 'Production reproducibilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'reproducibilityvaultizability_signal_table_coverage',
      label: 'Reproducibilityvaultizability signal table coverage',
      status: reproducibilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Reproducibilityvaultizability signal table coverage is only enforced in production.'
          : reproducibilityvaultizabilityTableCoverageComplete
            ? `${input.existingReproducibilityvaultizabilityTableCount}/${CRITICAL_REPRODUCIBILITYVAULTIZABILITY_TABLES.length} reproducibilityvaultizability signal tables are present.`
            : `${input.existingReproducibilityvaultizabilityTableCount}/${CRITICAL_REPRODUCIBILITYVAULTIZABILITY_TABLES.length} reproducibilityvaultizability signal tables were found.`,
    },
    {
      name: 'shield_scan_reproducibilityvaultizability',
      label: 'Shield scan reproducibilityvaultizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan reproducibilityvaultizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan reproducibilityvaultizability signals.'
            : 'Production reproducibilityvaultizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_reproducibilityvaultizability',
      label: 'Provider credential reproducibilityvaultizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential reproducibilityvaultizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential reproducibilityvaultizability signals.'
            : 'Production reproducibilityvaultizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          reproducibilityvaultizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              reproducibilityvaultizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production reproducibilityvaultizability rollout requires PostgreSQL connectivity, reproducibilityvaultizability tables, shield scan reproducibilityvaultizability, provider credential reproducibilityvaultizability, and full signal coverage.',
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
        ? 'Production reproducibilityvaultizability rollout checks passed. Reproducibilityvaultizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production reproducibilityvaultizability rollout is not ready. Resolve failed checks before relying on production reproducibilityvaultizability tooling.',
  }
}

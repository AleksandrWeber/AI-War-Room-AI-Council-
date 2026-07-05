import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TAXONOMIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type TaxonomizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TaxonomizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TaxonomizabilityRolloutCheck[]
  guidance: string
}

export type TaxonomizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTaxonomizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateTaxonomizabilityRollout(
  input: TaxonomizabilityRolloutInput,
): TaxonomizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const taxonomizabilityTableCoverageComplete =
    input.existingTaxonomizabilityTableCount === CRITICAL_TAXONOMIZABILITY_TABLES.length

  const checks: TaxonomizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL taxonomizability checks can reach the database.'
            : 'Production taxonomizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'taxonomizability_signal_table_coverage',
      label: 'Taxonomizability signal table coverage',
      status: taxonomizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Taxonomizability signal table coverage is only enforced in production.'
          : taxonomizabilityTableCoverageComplete
            ? `${input.existingTaxonomizabilityTableCount}/${CRITICAL_TAXONOMIZABILITY_TABLES.length} taxonomizability signal tables are present.`
            : `${input.existingTaxonomizabilityTableCount}/${CRITICAL_TAXONOMIZABILITY_TABLES.length} taxonomizability signal tables were found.`,
    },
    {
      name: 'shield_scan_taxonomizability',
      label: 'Shield scan taxonomizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan taxonomizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan taxonomizability signals.'
            : 'Production taxonomizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_taxonomizability',
      label: 'Provider credential taxonomizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential taxonomizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential taxonomizability signals.'
            : 'Production taxonomizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'taxonomization_readiness_signal',
      label: 'Taxonomization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          taxonomizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Taxonomization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              taxonomizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support taxonomization readiness.'
            : 'Production taxonomizability rollout requires PostgreSQL connectivity, taxonomizability tables, shield scan taxonomizability, provider credential taxonomizability, and full signal coverage.',
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
        ? 'Production taxonomizability rollout checks passed. Taxonomizability coverage and taxonomization readiness signal signals are healthy.'
        : 'Production taxonomizability rollout is not ready. Resolve failed checks before relying on production taxonomizability tooling.',
  }
}

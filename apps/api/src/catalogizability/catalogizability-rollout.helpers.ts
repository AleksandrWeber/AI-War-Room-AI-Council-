import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CATALOGIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type CatalogizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CatalogizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CatalogizabilityRolloutCheck[]
  guidance: string
}

export type CatalogizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCatalogizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateCatalogizabilityRollout(
  input: CatalogizabilityRolloutInput,
): CatalogizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const catalogizabilityTableCoverageComplete =
    input.existingCatalogizabilityTableCount === CRITICAL_CATALOGIZABILITY_TABLES.length

  const checks: CatalogizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL catalogizability checks can reach the database.'
            : 'Production catalogizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'catalogizability_signal_table_coverage',
      label: 'Catalogizability signal table coverage',
      status: catalogizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Catalogizability signal table coverage is only enforced in production.'
          : catalogizabilityTableCoverageComplete
            ? `${input.existingCatalogizabilityTableCount}/${CRITICAL_CATALOGIZABILITY_TABLES.length} catalogizability signal tables are present.`
            : `${input.existingCatalogizabilityTableCount}/${CRITICAL_CATALOGIZABILITY_TABLES.length} catalogizability signal tables were found.`,
    },
    {
      name: 'shield_scan_catalogizability',
      label: 'Shield scan catalogizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan catalogizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan catalogizability signals.'
            : 'Production catalogizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_catalogizability',
      label: 'Provider credential catalogizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential catalogizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential catalogizability signals.'
            : 'Production catalogizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'catalogization_readiness_signal',
      label: 'Catalogization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          catalogizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Catalogization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              catalogizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support catalogization readiness.'
            : 'Production catalogizability rollout requires PostgreSQL connectivity, catalogizability tables, shield scan catalogizability, provider credential catalogizability, and full signal coverage.',
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
        ? 'Production catalogizability rollout checks passed. Catalogizability coverage and catalogization readiness signal signals are healthy.'
        : 'Production catalogizability rollout is not ready. Resolve failed checks before relying on production catalogizability tooling.',
  }
}

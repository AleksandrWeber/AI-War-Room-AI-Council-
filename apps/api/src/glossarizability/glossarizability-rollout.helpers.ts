import type { ApiEnv } from '../config/env.js'

export const CRITICAL_GLOSSARIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type GlossarizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type GlossarizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: GlossarizabilityRolloutCheck[]
  guidance: string
}

export type GlossarizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingGlossarizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateGlossarizabilityRollout(
  input: GlossarizabilityRolloutInput,
): GlossarizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const glossarizabilityTableCoverageComplete =
    input.existingGlossarizabilityTableCount === CRITICAL_GLOSSARIZABILITY_TABLES.length

  const checks: GlossarizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL glossarizability checks can reach the database.'
            : 'Production glossarizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'glossarizability_signal_table_coverage',
      label: 'Glossarizability signal table coverage',
      status: glossarizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Glossarizability signal table coverage is only enforced in production.'
          : glossarizabilityTableCoverageComplete
            ? `${input.existingGlossarizabilityTableCount}/${CRITICAL_GLOSSARIZABILITY_TABLES.length} glossarizability signal tables are present.`
            : `${input.existingGlossarizabilityTableCount}/${CRITICAL_GLOSSARIZABILITY_TABLES.length} glossarizability signal tables were found.`,
    },
    {
      name: 'shield_scan_glossarizability',
      label: 'Shield scan glossarizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan glossarizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan glossarizability signals.'
            : 'Production glossarizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_glossarizability',
      label: 'Provider credential glossarizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential glossarizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential glossarizability signals.'
            : 'Production glossarizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'glossarization_readiness_signal',
      label: 'Glossarization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          glossarizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Glossarization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              glossarizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support glossarization readiness.'
            : 'Production glossarizability rollout requires PostgreSQL connectivity, glossarizability tables, shield scan glossarizability, provider credential glossarizability, and full signal coverage.',
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
        ? 'Production glossarizability rollout checks passed. Glossarizability coverage and glossarization readiness signal signals are healthy.'
        : 'Production glossarizability rollout is not ready. Resolve failed checks before relying on production glossarizability tooling.',
  }
}

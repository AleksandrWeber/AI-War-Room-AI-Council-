import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CERTIFIABILITY_TABLES = [
  'workspace_provider_credentials',
  'model_registry_entries',
  'billing_webhook_events',
] as const

export type CertifiabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CertifiabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CertifiabilityRolloutCheck[]
  guidance: string
}

export type CertifiabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCertifiabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  modelRegistryEntriesTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateCertifiabilityRollout(
  input: CertifiabilityRolloutInput,
): CertifiabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const certifiabilityTableCoverageComplete =
    input.existingCertifiabilityTableCount === CRITICAL_CERTIFIABILITY_TABLES.length

  const checks: CertifiabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL certifiability checks can reach the database.'
            : 'Production certifiability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'certifiability_signal_table_coverage',
      label: 'Certifiability signal table coverage',
      status: certifiabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Certifiability signal table coverage is only enforced in production.'
          : certifiabilityTableCoverageComplete
            ? `${input.existingCertifiabilityTableCount}/${CRITICAL_CERTIFIABILITY_TABLES.length} certifiability signal tables are present.`
            : `${input.existingCertifiabilityTableCount}/${CRITICAL_CERTIFIABILITY_TABLES.length} certifiability signal tables were found.`,
    },
    {
      name: 'provider_credential_certifiability',
      label: 'Provider credential certifiability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential certifiability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential certifiability signals.'
            : 'Production certifiability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'model_registry_certifiability',
      label: 'Model registry certifiability',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry certifiability is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry certifiability signals.'
            : 'Production certifiability rollout requires a model_registry_entries table.',
    },
    {
      name: 'certification_readiness_signal',
      label: 'Certification readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          certifiabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.modelRegistryEntriesTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Certification readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              certifiabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.modelRegistryEntriesTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Workspace provider credentials, model registry entries, and billing webhook events support certification readiness.'
            : 'Production certifiability rollout requires PostgreSQL connectivity, certifiability tables, provider credential certifiability, model registry certifiability, and full signal coverage.',
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
        ? 'Production certifiability rollout checks passed. Certifiability coverage and certification readiness signal signals are healthy.'
        : 'Production certifiability rollout is not ready. Resolve failed checks before relying on production certifiability tooling.',
  }
}

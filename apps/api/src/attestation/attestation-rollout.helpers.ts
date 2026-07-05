import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ATTESTATION_TABLES = [
  'model_registry_entries',
  'model_health_events',
  'workspace_provider_credentials',
] as const

export type AttestationRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AttestationRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AttestationRolloutCheck[]
  guidance: string
}

export type AttestationRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAttestationTableCount: number
  modelRegistryEntriesTableExists: boolean
  providerCredentialsTableExists: boolean
  modelHealthEventsTableExists: boolean
}

export function evaluateAttestationRollout(
  input: AttestationRolloutInput,
): AttestationRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const attestationTableCoverageComplete =
    input.existingAttestationTableCount === CRITICAL_ATTESTATION_TABLES.length

  const checks: AttestationRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL attestation checks can reach the database.'
            : 'Production attestation rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'attestation_signal_table_coverage',
      label: 'Attestation signal table coverage',
      status: attestationTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Attestation signal table coverage is only enforced in production.'
          : attestationTableCoverageComplete
            ? `${input.existingAttestationTableCount}/${CRITICAL_ATTESTATION_TABLES.length} attestation signal tables are present.`
            : `${input.existingAttestationTableCount}/${CRITICAL_ATTESTATION_TABLES.length} attestation signal tables were found.`,
    },
    {
      name: 'model_registry_attestation',
      label: 'Model registry attestation',
      status: input.modelRegistryEntriesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model registry attestation is only enforced in production.'
          : input.modelRegistryEntriesTableExists
            ? 'model_registry_entries table is available for model registry attestation signals.'
            : 'Production attestation rollout requires a model_registry_entries table.',
    },
    {
      name: 'provider_credential_attestation',
      label: 'Provider credential attestation',
      status: input.providerCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential attestation is only enforced in production.'
          : input.providerCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential attestation signals.'
            : 'Production attestation rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'verification_readiness_signal',
      label: 'Verification readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          attestationTableCoverageComplete &&
          input.modelRegistryEntriesTableExists &&
          input.providerCredentialsTableExists &&
          input.modelHealthEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Verification readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              attestationTableCoverageComplete &&
              input.modelRegistryEntriesTableExists &&
              input.providerCredentialsTableExists &&
              input.modelHealthEventsTableExists
            ? 'Model registry entries, health events, and provider credentials support verification readiness.'
            : 'Production attestation rollout requires PostgreSQL connectivity, attestation tables, model registry attestation, provider credential attestation, and full signal coverage.',
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
        ? 'Production attestation rollout checks passed. Attestation coverage and verification readiness signal signals are healthy.'
        : 'Production attestation rollout is not ready. Resolve failed checks before relying on production attestation tooling.',
  }
}

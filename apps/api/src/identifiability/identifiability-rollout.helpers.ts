import type { ApiEnv } from '../config/env.js'

export const CRITICAL_IDENTIFIABILITY_TABLES = [
  'idempotency_keys',
  'workspace_provider_credentials',
  'usage_events',
] as const

export type IdentifiabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type IdentifiabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: IdentifiabilityRolloutCheck[]
  guidance: string
}

export type IdentifiabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingIdentifiabilityTableCount: number
  idempotencyKeysTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateIdentifiabilityRollout(
  input: IdentifiabilityRolloutInput,
): IdentifiabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const identifiabilityTableCoverageComplete =
    input.existingIdentifiabilityTableCount === CRITICAL_IDENTIFIABILITY_TABLES.length

  const checks: IdentifiabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL identifiability checks can reach the database.'
            : 'Production identifiability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'identifiability_signal_table_coverage',
      label: 'Identifiability signal table coverage',
      status: identifiabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Identifiability signal table coverage is only enforced in production.'
          : identifiabilityTableCoverageComplete
            ? `${input.existingIdentifiabilityTableCount}/${CRITICAL_IDENTIFIABILITY_TABLES.length} identifiability signal tables are present.`
            : `${input.existingIdentifiabilityTableCount}/${CRITICAL_IDENTIFIABILITY_TABLES.length} identifiability signal tables were found.`,
    },
    {
      name: 'idempotency_key_identifiability',
      label: 'Idempotency key identifiability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key identifiability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key identifiability signals.'
            : 'Production identifiability rollout requires a idempotency_keys table.',
    },
    {
      name: 'provider_credential_identifiability',
      label: 'Provider credential identifiability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential identifiability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential identifiability signals.'
            : 'Production identifiability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'identity_readiness_signal',
      label: 'Identity readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          identifiabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Identity readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              identifiabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.usageEventsTableExists
            ? 'Idempotency keys, workspace provider credentials, and usage events support identity readiness.'
            : 'Production identifiability rollout requires PostgreSQL connectivity, identifiability tables, idempotency key identifiability, provider credential identifiability, and full signal coverage.',
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
        ? 'Production identifiability rollout checks passed. Identifiability coverage and identity readiness signal signals are healthy.'
        : 'Production identifiability rollout is not ready. Resolve failed checks before relying on production identifiability tooling.',
  }
}

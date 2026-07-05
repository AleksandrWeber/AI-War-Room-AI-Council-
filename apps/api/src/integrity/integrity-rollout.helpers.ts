import { DEFAULT_APP_ENCRYPTION_KEY } from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'

export const CRITICAL_INTEGRITY_TABLES = [
  'artifacts',
  'shield_scans',
  'runs',
] as const

export type IntegrityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type IntegrityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: IntegrityRolloutCheck[]
  guidance: string
}

export type IntegrityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingIntegrityTableCount: number
  artifactsTableExists: boolean
  shieldScansTableExists: boolean
  encryptionKeyConfigured: boolean
}

export function evaluateIntegrityRollout(
  input: IntegrityRolloutInput,
): IntegrityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const integrityTableCoverageComplete =
    input.existingIntegrityTableCount === CRITICAL_INTEGRITY_TABLES.length

  const checks: IntegrityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL integrity checks can reach the database.'
            : 'Production integrity rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'integrity_signal_table_coverage',
      label: 'Integrity signal table coverage',
      status:
        integrityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Integrity signal table coverage is only enforced in production.'
          : integrityTableCoverageComplete
            ? `${input.existingIntegrityTableCount}/${CRITICAL_INTEGRITY_TABLES.length} integrity signal tables are present.`
            : `${input.existingIntegrityTableCount}/${CRITICAL_INTEGRITY_TABLES.length} integrity signal tables were found.`,
    },
    {
      name: 'artifact_content_integrity',
      label: 'Artifact content integrity',
      status: input.artifactsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Artifact content integrity is only enforced in production.'
          : input.artifactsTableExists
            ? 'artifacts table is available for persisted content integrity signals.'
            : 'Production integrity rollout requires an artifacts table.',
    },
    {
      name: 'shield_scan_integrity',
      label: 'Shield scan integrity',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan integrity is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for security scan integrity signals.'
            : 'Production integrity rollout requires a shield_scans table.',
    },
    {
      name: 'verification_readiness_signal',
      label: 'Verification readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          integrityTableCoverageComplete &&
          input.artifactsTableExists &&
          input.shieldScansTableExists &&
          input.encryptionKeyConfigured)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Verification readiness is only enforced in production.'
          : input.postgresConnectivity &&
              integrityTableCoverageComplete &&
              input.artifactsTableExists &&
              input.shieldScansTableExists &&
              input.encryptionKeyConfigured
            ? 'Run outcomes, persisted artifacts, shield scans, and encryption support verification readiness.'
            : 'Production integrity rollout requires PostgreSQL connectivity, integrity tables, artifact and shield scan coverage, and configured encryption.',
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
        ? 'Production integrity rollout checks passed. Integrity coverage and verification readiness signals are healthy.'
        : 'Production integrity rollout is not ready. Resolve failed checks before relying on production integrity tooling.',
  }
}

export function isProductionEncryptionKeyConfigured(
  encryptionKey: string | undefined,
) {
  return Boolean(encryptionKey && encryptionKey !== DEFAULT_APP_ENCRYPTION_KEY)
}

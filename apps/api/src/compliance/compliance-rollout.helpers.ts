import { DEFAULT_APP_ENCRYPTION_KEY } from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'

export const CRITICAL_COMPLIANCE_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_records',
  'workspace_memberships',
] as const

export type ComplianceRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ComplianceRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ComplianceRolloutCheck[]
  guidance: string
}

export type ComplianceRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingPolicyTableCount: number
  encryptionKeyConfigured: boolean
}

export function evaluateComplianceRollout(
  input: ComplianceRolloutInput,
): ComplianceRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const policyTableCoverageComplete =
    input.existingPolicyTableCount === CRITICAL_COMPLIANCE_TABLES.length

  const checks: ComplianceRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL compliance checks can reach the database.'
            : 'Production compliance rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'policy_table_coverage',
      label: 'Policy table coverage',
      status: policyTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Policy table coverage is only enforced in production.'
          : policyTableCoverageComplete
            ? `${input.existingPolicyTableCount}/${CRITICAL_COMPLIANCE_TABLES.length} compliance policy tables are present.`
            : `${input.existingPolicyTableCount}/${CRITICAL_COMPLIANCE_TABLES.length} compliance policy tables were found.`,
    },
    {
      name: 'encryption_key_readiness',
      label: 'Encryption key readiness',
      status: input.encryptionKeyConfigured || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Encryption key readiness is only enforced in production.'
          : input.encryptionKeyConfigured
            ? 'APP_ENCRYPTION_KEY is configured for provider credential encryption.'
            : `Production compliance rollout requires APP_ENCRYPTION_KEY to differ from the default value (${DEFAULT_APP_ENCRYPTION_KEY.slice(0, 12)}...).`,
    },
    {
      name: 'workspace_role_governance',
      label: 'Workspace role governance',
      status: policyTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace role governance is only enforced in production.'
          : policyTableCoverageComplete
            ? 'Workspace memberships and policy tables support role-governed compliance tooling.'
            : 'Production compliance rollout requires workspace_memberships and related policy tables.',
    },
    {
      name: 'attestation_readiness_signal',
      label: 'Attestation readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          policyTableCoverageComplete &&
          input.encryptionKeyConfigured)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Attestation readiness is only enforced in production.'
          : input.postgresConnectivity &&
              policyTableCoverageComplete &&
              input.encryptionKeyConfigured
            ? 'Policy tables, encryption readiness, and PostgreSQL connectivity support compliance attestation.'
            : 'Production compliance rollout requires PostgreSQL connectivity, policy tables, and encryption key readiness.',
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
        ? 'Production compliance rollout checks passed. Policy coverage and attestation readiness signals are healthy.'
        : 'Production compliance rollout is not ready. Resolve failed checks before relying on production compliance tooling.',
  }
}

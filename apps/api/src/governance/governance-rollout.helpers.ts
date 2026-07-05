import type { ApiEnv } from '../config/env.js'

export const CRITICAL_GOVERNANCE_TABLES = [
  'workspace_memberships',
  'workspace_provider_credentials',
  'shield_scans',
] as const

export type GovernanceRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type GovernanceRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: GovernanceRolloutCheck[]
  guidance: string
}

export type GovernanceRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingGovernanceTableCount: number
  workspaceMembershipsTableExists: boolean
  providerCredentialsTableExists: boolean
  shieldScansTableExists: boolean
}

export function evaluateGovernanceRollout(
  input: GovernanceRolloutInput,
): GovernanceRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const governanceTableCoverageComplete =
    input.existingGovernanceTableCount === CRITICAL_GOVERNANCE_TABLES.length

  const checks: GovernanceRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL governance checks can reach the database.'
            : 'Production governance rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'governance_signal_table_coverage',
      label: 'Governance signal table coverage',
      status: governanceTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Governance signal table coverage is only enforced in production.'
          : governanceTableCoverageComplete
            ? `${input.existingGovernanceTableCount}/${CRITICAL_GOVERNANCE_TABLES.length} governance signal tables are present.`
            : `${input.existingGovernanceTableCount}/${CRITICAL_GOVERNANCE_TABLES.length} governance signal tables were found.`,
    },
    {
      name: 'access_governance',
      label: 'Access governance',
      status:
        input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Access governance is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for access governance signals.'
            : 'Production governance rollout requires a workspace_memberships table.',
    },
    {
      name: 'credential_governance',
      label: 'Credential governance',
      status:
        input.providerCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Credential governance is only enforced in production.'
          : input.providerCredentialsTableExists
            ? 'workspace_provider_credentials table is available for credential governance signals.'
            : 'Production governance rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'policy_readiness_signal',
      label: 'Policy readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          governanceTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.providerCredentialsTableExists &&
          input.shieldScansTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Policy readiness is only enforced in production.'
          : input.postgresConnectivity &&
              governanceTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.providerCredentialsTableExists &&
              input.shieldScansTableExists
            ? 'Membership access, provider credentials, and shield reviews support policy readiness.'
            : 'Production governance rollout requires PostgreSQL connectivity, governance tables, access governance, credential governance, and shield policy coverage.',
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
        ? 'Production governance rollout checks passed. Governance coverage and policy readiness signals are healthy.'
        : 'Production governance rollout is not ready. Resolve failed checks before relying on production governance tooling.',
  }
}

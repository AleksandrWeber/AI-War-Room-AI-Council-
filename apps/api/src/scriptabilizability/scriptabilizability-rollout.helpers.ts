import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SCRIPTABILIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type ScriptabilizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ScriptabilizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ScriptabilizabilityRolloutCheck[]
  guidance: string
}

export type ScriptabilizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingScriptabilizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateScriptabilizabilityRollout(
  input: ScriptabilizabilityRolloutInput,
): ScriptabilizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const scriptabilizabilityTableCoverageComplete =
    input.existingScriptabilizabilityTableCount === CRITICAL_SCRIPTABILIZABILITY_TABLES.length

  const checks: ScriptabilizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL scriptabilizability checks can reach the database.'
            : 'Production scriptabilizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'scriptabilizability_signal_table_coverage',
      label: 'Scriptabilizability signal table coverage',
      status: scriptabilizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Scriptabilizability signal table coverage is only enforced in production.'
          : scriptabilizabilityTableCoverageComplete
            ? `${input.existingScriptabilizabilityTableCount}/${CRITICAL_SCRIPTABILIZABILITY_TABLES.length} scriptabilizability signal tables are present.`
            : `${input.existingScriptabilizabilityTableCount}/${CRITICAL_SCRIPTABILIZABILITY_TABLES.length} scriptabilizability signal tables were found.`,
    },
    {
      name: 'shield_scan_scriptabilizability',
      label: 'Shield scan scriptabilizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan scriptabilizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan scriptabilizability signals.'
            : 'Production scriptabilizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_scriptabilizability',
      label: 'Provider credential scriptabilizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential scriptabilizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential scriptabilizability signals.'
            : 'Production scriptabilizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'scriptabilization_readiness_signal',
      label: 'Scriptabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          scriptabilizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Scriptabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              scriptabilizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support scriptabilization readiness.'
            : 'Production scriptabilizability rollout requires PostgreSQL connectivity, scriptabilizability tables, shield scan scriptabilizability, provider credential scriptabilizability, and full signal coverage.',
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
        ? 'Production scriptabilizability rollout checks passed. Scriptabilizability coverage and scriptabilization readiness signal signals are healthy.'
        : 'Production scriptabilizability rollout is not ready. Resolve failed checks before relying on production scriptabilizability tooling.',
  }
}

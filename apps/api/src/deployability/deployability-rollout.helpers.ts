import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DEPLOYABILITY_TABLES = [
  'workspace_provider_credentials',
  'billing_webhook_events',
  'usage_events',
] as const

export type DeployabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DeployabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DeployabilityRolloutCheck[]
  guidance: string
}

export type DeployabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDeployabilityTableCount: number
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateDeployabilityRollout(
  input: DeployabilityRolloutInput,
): DeployabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const deployabilityTableCoverageComplete =
    input.existingDeployabilityTableCount === CRITICAL_DEPLOYABILITY_TABLES.length

  const checks: DeployabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL deployability checks can reach the database.'
            : 'Production deployability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'deployability_signal_table_coverage',
      label: 'Deployability signal table coverage',
      status: deployabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Deployability signal table coverage is only enforced in production.'
          : deployabilityTableCoverageComplete
            ? `${input.existingDeployabilityTableCount}/${CRITICAL_DEPLOYABILITY_TABLES.length} deployability signal tables are present.`
            : `${input.existingDeployabilityTableCount}/${CRITICAL_DEPLOYABILITY_TABLES.length} deployability signal tables were found.`,
    },
    {
      name: 'provider_credential_deployability',
      label: 'Provider credential deployability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential deployability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential deployability signals.'
            : 'Production deployability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'billing_webhook_deployability',
      label: 'Billing webhook deployability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook deployability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook deployability signals.'
            : 'Production deployability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'deployment_readiness_signal',
      label: 'Deployment readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          deployabilityTableCoverageComplete &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Deployment readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              deployabilityTableCoverageComplete &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Workspace provider credentials, billing webhook events, and usage events support deployment readiness.'
            : 'Production deployability rollout requires PostgreSQL connectivity, deployability tables, provider credential deployability, billing webhook deployability, and full signal coverage.',
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
        ? 'Production deployability rollout checks passed. Deployability coverage and deployment readiness signal signals are healthy.'
        : 'Production deployability rollout is not ready. Resolve failed checks before relying on production deployability tooling.',
  }
}

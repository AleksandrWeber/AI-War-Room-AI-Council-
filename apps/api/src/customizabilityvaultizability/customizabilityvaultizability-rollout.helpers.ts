import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CUSTOMIZABILITYVAULTIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type CustomizabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CustomizabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CustomizabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type CustomizabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCustomizabilityvaultizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateCustomizabilityvaultizabilityRollout(
  input: CustomizabilityvaultizabilityRolloutInput,
): CustomizabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const customizabilityvaultizabilityTableCoverageComplete =
    input.existingCustomizabilityvaultizabilityTableCount === CRITICAL_CUSTOMIZABILITYVAULTIZABILITY_TABLES.length

  const checks: CustomizabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL customizabilityvaultizability checks can reach the database.'
            : 'Production customizabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'customizabilityvaultizability_signal_table_coverage',
      label: 'Customizabilityvaultizability signal table coverage',
      status: customizabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Customizabilityvaultizability signal table coverage is only enforced in production.'
          : customizabilityvaultizabilityTableCoverageComplete
            ? `${input.existingCustomizabilityvaultizabilityTableCount}/${CRITICAL_CUSTOMIZABILITYVAULTIZABILITY_TABLES.length} customizabilityvaultizability signal tables are present.`
            : `${input.existingCustomizabilityvaultizabilityTableCount}/${CRITICAL_CUSTOMIZABILITYVAULTIZABILITY_TABLES.length} customizabilityvaultizability signal tables were found.`,
    },
    {
      name: 'membership_customizabilityvaultizability',
      label: 'Membership customizabilityvaultizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership customizabilityvaultizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership customizabilityvaultizability signals.'
            : 'Production customizabilityvaultizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_customizabilityvaultizability',
      label: 'Usage event customizabilityvaultizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event customizabilityvaultizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event customizabilityvaultizability signals.'
            : 'Production customizabilityvaultizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          customizabilityvaultizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              customizabilityvaultizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production customizabilityvaultizability rollout requires PostgreSQL connectivity, customizabilityvaultizability tables, membership customizabilityvaultizability, usage event customizabilityvaultizability, and full signal coverage.',
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
        ? 'Production customizabilityvaultizability rollout checks passed. Customizabilityvaultizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production customizabilityvaultizability rollout is not ready. Resolve failed checks before relying on production customizabilityvaultizability tooling.',
  }
}

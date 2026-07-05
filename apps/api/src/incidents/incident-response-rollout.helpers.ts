import type { ApiEnv } from '../config/env.js'

export const CRITICAL_INCIDENT_TABLES = [
  'runs',
  'billing_notifications',
  'model_health_events',
] as const

export type IncidentResponseRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type IncidentResponseRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: IncidentResponseRolloutCheck[]
  guidance: string
}

export type IncidentResponseRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingIncidentTableCount: number
  billingAlertEscalationConfigured: boolean
  observabilityBufferCapacity: number
}

export function evaluateIncidentResponseRollout(
  input: IncidentResponseRolloutInput,
): IncidentResponseRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const incidentTableCoverageComplete =
    input.existingIncidentTableCount === CRITICAL_INCIDENT_TABLES.length
  const observabilityBufferReady = input.observabilityBufferCapacity >= 100

  const checks: IncidentResponseRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL incident response checks can reach the database.'
            : 'Production incident response rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'incident_signal_table_coverage',
      label: 'Incident signal table coverage',
      status:
        incidentTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Incident signal table coverage is only enforced in production.'
          : incidentTableCoverageComplete
            ? `${input.existingIncidentTableCount}/${CRITICAL_INCIDENT_TABLES.length} incident signal tables are present.`
            : `${input.existingIncidentTableCount}/${CRITICAL_INCIDENT_TABLES.length} incident signal tables were found.`,
    },
    {
      name: 'billing_alert_escalation',
      label: 'Billing alert escalation',
      status:
        input.billingAlertEscalationConfigured || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing alert escalation is only enforced in production.'
          : input.billingAlertEscalationConfigured
            ? 'Billing notification escalation is configured for incident alerts.'
            : 'Production incident response rollout requires billing notification escalation configuration.',
    },
    {
      name: 'observability_incident_buffer',
      label: 'Observability incident buffer',
      status: observabilityBufferReady ? 'pass' : 'fail',
      detail: observabilityBufferReady
        ? `Observability buffer capacity is ${input.observabilityBufferCapacity} recent event(s).`
        : 'Production incident response rollout requires an observability incident buffer capacity of at least 100 events.',
    },
    {
      name: 'escalation_readiness_signal',
      label: 'Escalation readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          incidentTableCoverageComplete &&
          input.billingAlertEscalationConfigured &&
          observabilityBufferReady)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Escalation readiness is only enforced in production.'
          : input.postgresConnectivity &&
              incidentTableCoverageComplete &&
              input.billingAlertEscalationConfigured &&
              observabilityBufferReady
            ? 'Incident signal tables, billing escalation, and observability buffers support escalation readiness.'
            : 'Production incident response rollout requires PostgreSQL connectivity, incident tables, billing escalation, and observability buffers.',
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
        ? 'Production incident response rollout checks passed. Incident coverage and escalation readiness signals are healthy.'
        : 'Production incident response rollout is not ready. Resolve failed checks before relying on production incident tooling.',
  }
}

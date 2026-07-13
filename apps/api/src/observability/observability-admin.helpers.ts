import type {
  ObservabilityAdminAction,
  ObservabilityAdminEvent,
  ObservabilityAdminStats,
  ObservabilityAlert,
} from '@ai-war-room/schemas'
import type { ObservabilityEvent } from './observability.service.js'

export const STREAM_LAG_WARNING_MS = 60_000

export function buildObservabilityAdminStats(
  events: ObservabilityAdminEvent[],
): ObservabilityAdminStats {
  return {
    totalEvents: events.length,
    errorEvents: events.filter((event) => event.level === 'error').length,
    warnEvents: events.filter((event) => event.level === 'warn').length,
    pipelinePhaseEvents: events.filter((event) =>
      event.eventName.startsWith('pipeline_'),
    ).length,
    shieldEvents: events.filter((event) => event.eventName.startsWith('shield_'))
      .length,
    llmEvents: events.filter((event) => event.eventName.startsWith('llm_')).length,
  }
}

export function buildObservabilityAlerts(input: {
  workspaceId: string
  nowMs?: number
  temporalEnabled: boolean
  temporalHealthy: boolean
  temporalGuidance?: string
  streamSummaries: Array<{
    runId: string
    lastEventAt?: string
    terminal: boolean
  }>
  recentEvents: ObservabilityEvent[]
}): ObservabilityAlert[] {
  const nowMs = input.nowMs ?? Date.now()
  const createdAt = new Date(nowMs).toISOString()
  const alerts: ObservabilityAlert[] = []

  if (input.temporalEnabled && !input.temporalHealthy) {
    alerts.push({
      alertId: `${input.workspaceId}:worker_health`,
      workspaceId: input.workspaceId,
      type: 'worker_health',
      severity: 'critical',
      message:
        input.temporalGuidance ??
        'Temporal runtime is unhealthy while TEMPORAL_ENABLED=true.',
      createdAt,
    })
  }

  const laggedStreams = input.streamSummaries.filter((summary) => {
    if (summary.terminal || !summary.lastEventAt) {
      return false
    }

    const ageMs = nowMs - Date.parse(summary.lastEventAt)
    return Number.isFinite(ageMs) && ageMs >= STREAM_LAG_WARNING_MS
  })

  if (laggedStreams.length > 0) {
    alerts.push({
      alertId: `${input.workspaceId}:stream_lag`,
      workspaceId: input.workspaceId,
      type: 'stream_lag',
      severity: laggedStreams.length >= 3 ? 'critical' : 'warning',
      message: `${laggedStreams.length} non-terminal stream(s) have no events for at least ${STREAM_LAG_WARNING_MS / 1000}s.`,
      createdAt,
    })
  }

  const providerFailures = input.recentEvents.filter(
    (event) => event.eventName === 'llm_provider_failure',
  )

  if (providerFailures.length > 0) {
    alerts.push({
      alertId: `${input.workspaceId}:provider_failure`,
      workspaceId: input.workspaceId,
      type: 'provider_failure',
      severity: 'warning',
      message: `${providerFailures.length} recent LLM provider failure event(s) recorded in the observability buffer.`,
      createdAt,
    })
  }

  return alerts
}

export function resolveObservabilityAdminActions(input: {
  stats: ObservabilityAdminStats
}) {
  const actions: ObservabilityAdminAction[] = ['refresh_event_summary']

  if (input.stats.totalEvents > 0) {
    actions.push('clear_observability_buffer')
  }

  return actions
}

export function getObservabilityAdminGuidance(input: {
  stats: ObservabilityAdminStats
  alerts?: ObservabilityAlert[]
}) {
  const criticalAlert = input.alerts?.find(
    (alert) => alert.severity === 'critical',
  )

  if (criticalAlert) {
    return `Critical observability alert: ${criticalAlert.message}`
  }

  if ((input.alerts?.length ?? 0) > 0) {
    return 'Workspace owners and admins can inspect active observability alerts for worker health, stream lag, and provider failures.'
  }

  if (input.stats.errorEvents > 0) {
    return 'Workspace owners and admins can inspect recent pipeline error events and refresh the observability summary.'
  }

  if (input.stats.totalEvents === 0) {
    return 'Workspace owners and admins can inspect pipeline observability metrics once recent events are recorded.'
  }

  return 'Workspace owners and admins can inspect recent pipeline observability events and refresh the local event buffer.'
}

export function toObservabilityAdminEvents(
  events: ObservabilityEvent[],
  limit = 20,
): ObservabilityAdminEvent[] {
  return events.slice(-limit).reverse().map((event) => ({
    eventName: event.eventName,
    level: event.level,
    timestamp: event.timestamp,
    runId:
      typeof event.attributes.runId === 'string'
        ? event.attributes.runId
        : undefined,
  }))
}

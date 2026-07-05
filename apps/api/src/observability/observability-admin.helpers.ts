import type {
  ObservabilityAdminAction,
  ObservabilityAdminEvent,
  ObservabilityAdminStats,
} from '@ai-war-room/schemas'
import type { ObservabilityEvent } from './observability.service.js'

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
}) {
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

import type {
  StreamRecoveryAdminAction,
  StreamRecoveryAdminRecord,
  StreamRecoveryAdminStats,
} from '@ai-war-room/schemas'
import type { PipelineStreamEvent } from './pipeline-stream-event.js'
import { isTerminalPipelineStreamEvent } from './pipeline-stream-event.js'

export type BufferedStreamSummary = {
  runId: string
  eventCount: number
  lastEvent?: PipelineStreamEvent
}

export function toStreamRecoveryAdminRecord(
  summary: BufferedStreamSummary,
): StreamRecoveryAdminRecord {
  const lastEvent = summary.lastEvent

  return {
    runId: summary.runId,
    eventCount: summary.eventCount,
    lastEventType: lastEvent?.type ?? 'unknown',
    lastEventId: lastEvent?.eventId,
    lastEventAt: lastEvent?.timestamp,
    terminal: lastEvent ? isTerminalPipelineStreamEvent(lastEvent) : false,
  }
}

export function buildStreamRecoveryAdminStats(
  records: StreamRecoveryAdminRecord[],
): StreamRecoveryAdminStats {
  return {
    bufferedRunCount: records.length,
    totalBufferedEvents: records.reduce(
      (total, record) => total + record.eventCount,
      0,
    ),
    terminalRunCount: records.filter((record) => record.terminal).length,
    activeRunCount: records.filter((record) => !record.terminal).length,
    replayReadyRunCount: records.filter((record) => record.eventCount > 0).length,
  }
}

export function getStreamRecoveryAdminGuidance(input: {
  stats: StreamRecoveryAdminStats
}) {
  if (input.stats.bufferedRunCount === 0) {
    return 'Workspace owners and admins can inspect stream recovery metrics once buffered SSE runs exist.'
  }

  if (input.stats.activeRunCount > 0) {
    return 'Workspace owners and admins can inspect active buffered runs and refresh stream recovery summaries.'
  }

  return 'Workspace owners and admins can inspect buffered SSE runs and clear stale stream buffers when needed.'
}

export function resolveStreamRecoveryAdminActions(input: {
  stats: StreamRecoveryAdminStats
}): StreamRecoveryAdminAction[] {
  const actions: StreamRecoveryAdminAction[] = [
    'refresh_stream_recovery_summary',
  ]

  if (input.stats.bufferedRunCount > 0) {
    actions.push('clear_workspace_stream_buffers')
  }

  return actions
}

import type {
  PerformanceAdminAction,
  PerformanceAdminRecord,
  PerformanceAdminStats,
} from '@ai-war-room/schemas'

export type WorkspacePerformanceDomainInventory = {
  domain: PerformanceAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export type PipelinePhaseLatencySample = {
  phase: string
  durationMs: number
  runId?: string
}

export function rankSlowestPipelinePhases(
  events: Array<{
    eventName: string
    attributes: Record<string, string | number | boolean | null>
  }>,
  limit = 5,
): PipelinePhaseLatencySample[] {
  return events
    .filter(
      (event) =>
        event.eventName === 'pipeline_phase_completed' &&
        typeof event.attributes.durationMs === 'number' &&
        typeof event.attributes.phase === 'string' &&
        event.attributes.phase.length > 0,
    )
    .map((event) => ({
      phase: String(event.attributes.phase),
      durationMs: Number(event.attributes.durationMs),
      runId:
        typeof event.attributes.runId === 'string'
          ? event.attributes.runId
          : undefined,
    }))
    .sort((left, right) => right.durationMs - left.durationMs)
    .slice(0, limit)
}

export function buildPerformanceAdminRecords(
  inventory: WorkspacePerformanceDomainInventory[],
): PerformanceAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildPerformanceAdminStats(input: {
  records: PerformanceAdminRecord[]
  postgresConnectivity: boolean
  pipelineEventCount: number
  latencyEventCount: number
  averageLatencyMs: number
  slowestPipelinePhases?: PipelinePhaseLatencySample[]
}): PerformanceAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const latencySignalPercent =
    input.pipelineEventCount === 0
      ? 100
      : Math.round((input.latencyEventCount / input.pipelineEventCount) * 100)

  return {
    totalRecords: input.records.reduce(
      (total, record) => total + record.recordCount,
      0,
    ),
    coveredDomains,
    totalDomains: input.records.length,
    postgresConnectivity: input.postgresConnectivity,
    averageLatencyMs: input.averageLatencyMs,
    latencySignalPercent,
    slowestPipelinePhases: input.slowestPipelinePhases ?? [],
  }
}

export function getPerformanceAdminGuidance(input: {
  stats: PerformanceAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect performance metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial performance coverage and refresh the performance summary.'
  }

  if (input.stats.latencySignalPercent < 80) {
    return 'Workspace owners and admins can inspect pipeline latency signals below the 80% coverage target and refresh the performance summary.'
  }

  if (input.stats.averageLatencyMs >= 5_000) {
    return 'Workspace owners and admins can inspect elevated average pipeline latency above 5000ms and refresh the performance summary.'
  }

  const slowest = input.stats.slowestPipelinePhases[0]

  if (slowest && slowest.durationMs >= 5_000) {
    return `Workspace owners and admins can inspect the slowest recent pipeline phase (${slowest.phase} at ${slowest.durationMs}ms) and refresh the performance summary.`
  }

  return 'Workspace owners and admins can inspect workspace performance coverage and refresh the performance summary.'
}

export function resolvePerformanceAdminActions(): PerformanceAdminAction[] {
  return ['refresh_performance_summary']
}

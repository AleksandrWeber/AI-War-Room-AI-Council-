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

  return 'Workspace owners and admins can inspect workspace performance coverage and refresh the performance summary.'
}

export function resolvePerformanceAdminActions(): PerformanceAdminAction[] {
  return ['refresh_performance_summary']
}

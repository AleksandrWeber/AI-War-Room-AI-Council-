import type {
  MonitorabilityAdminAction,
  MonitorabilityAdminRecord,
  MonitorabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceMonitorabilityDomainInventory = {
  domain: MonitorabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildMonitorabilityAdminRecords(
  inventory: WorkspaceMonitorabilityDomainInventory[],
): MonitorabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildMonitorabilityAdminStats(input: {
  records: MonitorabilityAdminRecord[]
  postgresConnectivity: boolean
}): MonitorabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'usage_events')
      ?.recordCount ?? 0
  const monitorabilityPercent =
    completedRuns === 0
      ? 100
      : Math.min(100, Math.round((metricRecords / completedRuns) * 100))

  return {
    totalRecords: input.records.reduce(
      (total, record) => total + record.recordCount,
      0,
    ),
    coveredDomains,
    totalDomains: input.records.length,
    postgresConnectivity: input.postgresConnectivity,
    monitorabilityPercent,
  }
}

export function getMonitorabilityAdminGuidance(input: {
  stats: MonitorabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect monitorability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial monitorability coverage and refresh the monitorability summary.'
  }

  if (input.stats.monitorabilityPercent < 95) {
    return 'Workspace owners and admins can inspect usage event monitorability below the 95% target and refresh the monitorability summary.'
  }

  return 'Workspace owners and admins can inspect workspace monitorability coverage and refresh the monitorability summary.'
}

export function resolveMonitorabilityAdminActions(): MonitorabilityAdminAction[] {
  return ['refresh_monitorability_summary']
}

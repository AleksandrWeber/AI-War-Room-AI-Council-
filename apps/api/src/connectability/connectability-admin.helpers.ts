import type {
  ConnectabilityAdminAction,
  ConnectabilityAdminRecord,
  ConnectabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceConnectabilityDomainInventory = {
  domain: ConnectabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildConnectabilityAdminRecords(
  inventory: WorkspaceConnectabilityDomainInventory[],
): ConnectabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildConnectabilityAdminStats(input: {
  records: ConnectabilityAdminRecord[]
  postgresConnectivity: boolean
}): ConnectabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'usage_events')
      ?.recordCount ?? 0
  const connectabilityPercent =
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
    connectabilityPercent,
  }
}

export function getConnectabilityAdminGuidance(input: {
  stats: ConnectabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect connectability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial connectability coverage and refresh the connectability summary.'
  }

  if (input.stats.connectabilityPercent < 95) {
    return 'Workspace owners and admins can inspect usage event connectability below the 95% target and refresh the connectability summary.'
  }

  return 'Workspace owners and admins can inspect workspace connectability coverage and refresh the connectability summary.'
}

export function resolveConnectabilityAdminActions(): ConnectabilityAdminAction[] {
  return ['refresh_connectability_summary']
}

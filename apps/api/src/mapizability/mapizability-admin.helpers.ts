import type {
  MapizabilityAdminAction,
  MapizabilityAdminRecord,
  MapizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceMapizabilityDomainInventory = {
  domain: MapizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildMapizabilityAdminRecords(
  inventory: WorkspaceMapizabilityDomainInventory[],
): MapizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildMapizabilityAdminStats(input: {
  records: MapizabilityAdminRecord[]
  postgresConnectivity: boolean
}): MapizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const mapizabilityPercent =
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
    mapizabilityPercent,
  }
}

export function getMapizabilityAdminGuidance(input: {
  stats: MapizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect mapizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial mapizability coverage and refresh the mapizability summary.'
  }

  if (input.stats.mapizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage mapizability below the 95% target and refresh the mapizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace mapizability coverage and refresh the mapizability summary.'
}

export function resolveMapizabilityAdminActions(): MapizabilityAdminAction[] {
  return ['refresh_mapizability_summary']
}

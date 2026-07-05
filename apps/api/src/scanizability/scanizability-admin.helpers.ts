import type {
  ScanizabilityAdminAction,
  ScanizabilityAdminRecord,
  ScanizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceScanizabilityDomainInventory = {
  domain: ScanizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildScanizabilityAdminRecords(
  inventory: WorkspaceScanizabilityDomainInventory[],
): ScanizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildScanizabilityAdminStats(input: {
  records: ScanizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ScanizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const scanizabilityPercent =
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
    scanizabilityPercent,
  }
}

export function getScanizabilityAdminGuidance(input: {
  stats: ScanizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect scanizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial scanizability coverage and refresh the scanizability summary.'
  }

  if (input.stats.scanizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health scanizability below the 95% target and refresh the scanizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace scanizability coverage and refresh the scanizability summary.'
}

export function resolveScanizabilityAdminActions(): ScanizabilityAdminAction[] {
  return ['refresh_scanizability_summary']
}

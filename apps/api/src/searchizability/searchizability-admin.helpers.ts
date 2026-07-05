import type {
  SearchizabilityAdminAction,
  SearchizabilityAdminRecord,
  SearchizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSearchizabilityDomainInventory = {
  domain: SearchizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSearchizabilityAdminRecords(
  inventory: WorkspaceSearchizabilityDomainInventory[],
): SearchizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSearchizabilityAdminStats(input: {
  records: SearchizabilityAdminRecord[]
  postgresConnectivity: boolean
}): SearchizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const searchizabilityPercent =
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
    searchizabilityPercent,
  }
}

export function getSearchizabilityAdminGuidance(input: {
  stats: SearchizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect searchizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial searchizability coverage and refresh the searchizability summary.'
  }

  if (input.stats.searchizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan searchizability below the 95% target and refresh the searchizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace searchizability coverage and refresh the searchizability summary.'
}

export function resolveSearchizabilityAdminActions(): SearchizabilityAdminAction[] {
  return ['refresh_searchizability_summary']
}

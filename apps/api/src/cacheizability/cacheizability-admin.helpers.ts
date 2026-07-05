import type {
  CacheizabilityAdminAction,
  CacheizabilityAdminRecord,
  CacheizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCacheizabilityDomainInventory = {
  domain: CacheizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCacheizabilityAdminRecords(
  inventory: WorkspaceCacheizabilityDomainInventory[],
): CacheizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCacheizabilityAdminStats(input: {
  records: CacheizabilityAdminRecord[]
  postgresConnectivity: boolean
}): CacheizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const cacheizabilityPercent =
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
    cacheizabilityPercent,
  }
}

export function getCacheizabilityAdminGuidance(input: {
  stats: CacheizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect cacheizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial cacheizability coverage and refresh the cacheizability summary.'
  }

  if (input.stats.cacheizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health cacheizability below the 95% target and refresh the cacheizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace cacheizability coverage and refresh the cacheizability summary.'
}

export function resolveCacheizabilityAdminActions(): CacheizabilityAdminAction[] {
  return ['refresh_cacheizability_summary']
}

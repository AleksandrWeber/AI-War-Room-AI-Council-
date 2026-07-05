import type {
  IndexingizabilityAdminAction,
  IndexingizabilityAdminRecord,
  IndexingizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceIndexingizabilityDomainInventory = {
  domain: IndexingizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildIndexingizabilityAdminRecords(
  inventory: WorkspaceIndexingizabilityDomainInventory[],
): IndexingizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildIndexingizabilityAdminStats(input: {
  records: IndexingizabilityAdminRecord[]
  postgresConnectivity: boolean
}): IndexingizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const indexingizabilityPercent =
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
    indexingizabilityPercent,
  }
}

export function getIndexingizabilityAdminGuidance(input: {
  stats: IndexingizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect indexingizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial indexingizability coverage and refresh the indexingizability summary.'
  }

  if (input.stats.indexingizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health indexingizability below the 95% target and refresh the indexingizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace indexingizability coverage and refresh the indexingizability summary.'
}

export function resolveIndexingizabilityAdminActions(): IndexingizabilityAdminAction[] {
  return ['refresh_indexingizability_summary']
}

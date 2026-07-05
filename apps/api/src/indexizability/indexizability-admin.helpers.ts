import type {
  IndexizabilityAdminAction,
  IndexizabilityAdminRecord,
  IndexizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceIndexizabilityDomainInventory = {
  domain: IndexizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildIndexizabilityAdminRecords(
  inventory: WorkspaceIndexizabilityDomainInventory[],
): IndexizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildIndexizabilityAdminStats(input: {
  records: IndexizabilityAdminRecord[]
  postgresConnectivity: boolean
}): IndexizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const indexizabilityPercent =
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
    indexizabilityPercent,
  }
}

export function getIndexizabilityAdminGuidance(input: {
  stats: IndexizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect indexizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial indexizability coverage and refresh the indexizability summary.'
  }

  if (input.stats.indexizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key indexizability below the 95% target and refresh the indexizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace indexizability coverage and refresh the indexizability summary.'
}

export function resolveIndexizabilityAdminActions(): IndexizabilityAdminAction[] {
  return ['refresh_indexizability_summary']
}

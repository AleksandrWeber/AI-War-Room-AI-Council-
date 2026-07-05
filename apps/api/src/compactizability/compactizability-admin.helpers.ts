import type {
  CompactizabilityAdminAction,
  CompactizabilityAdminRecord,
  CompactizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCompactizabilityDomainInventory = {
  domain: CompactizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCompactizabilityAdminRecords(
  inventory: WorkspaceCompactizabilityDomainInventory[],
): CompactizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCompactizabilityAdminStats(input: {
  records: CompactizabilityAdminRecord[]
  postgresConnectivity: boolean
}): CompactizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const compactizabilityPercent =
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
    compactizabilityPercent,
  }
}

export function getCompactizabilityAdminGuidance(input: {
  stats: CompactizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect compactizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial compactizability coverage and refresh the compactizability summary.'
  }

  if (input.stats.compactizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership compactizability below the 95% target and refresh the compactizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace compactizability coverage and refresh the compactizability summary.'
}

export function resolveCompactizabilityAdminActions(): CompactizabilityAdminAction[] {
  return ['refresh_compactizability_summary']
}

import type {
  SortizabilityAdminAction,
  SortizabilityAdminRecord,
  SortizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSortizabilityDomainInventory = {
  domain: SortizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSortizabilityAdminRecords(
  inventory: WorkspaceSortizabilityDomainInventory[],
): SortizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSortizabilityAdminStats(input: {
  records: SortizabilityAdminRecord[]
  postgresConnectivity: boolean
}): SortizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_usage_limits')
      ?.recordCount ?? 0
  const sortizabilityPercent =
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
    sortizabilityPercent,
  }
}

export function getSortizabilityAdminGuidance(input: {
  stats: SortizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect sortizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial sortizability coverage and refresh the sortizability summary.'
  }

  if (input.stats.sortizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workspace limit sortizability below the 95% target and refresh the sortizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace sortizability coverage and refresh the sortizability summary.'
}

export function resolveSortizabilityAdminActions(): SortizabilityAdminAction[] {
  return ['refresh_sortizability_summary']
}

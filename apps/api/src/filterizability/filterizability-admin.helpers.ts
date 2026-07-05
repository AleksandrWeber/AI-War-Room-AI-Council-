import type {
  FilterizabilityAdminAction,
  FilterizabilityAdminRecord,
  FilterizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceFilterizabilityDomainInventory = {
  domain: FilterizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildFilterizabilityAdminRecords(
  inventory: WorkspaceFilterizabilityDomainInventory[],
): FilterizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildFilterizabilityAdminStats(input: {
  records: FilterizabilityAdminRecord[]
  postgresConnectivity: boolean
}): FilterizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const filterizabilityPercent =
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
    filterizabilityPercent,
  }
}

export function getFilterizabilityAdminGuidance(input: {
  stats: FilterizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect filterizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial filterizability coverage and refresh the filterizability summary.'
  }

  if (input.stats.filterizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage filterizability below the 95% target and refresh the filterizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace filterizability coverage and refresh the filterizability summary.'
}

export function resolveFilterizabilityAdminActions(): FilterizabilityAdminAction[] {
  return ['refresh_filterizability_summary']
}

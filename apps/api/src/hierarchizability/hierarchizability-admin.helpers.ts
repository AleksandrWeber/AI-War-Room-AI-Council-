import type {
  HierarchizabilityAdminAction,
  HierarchizabilityAdminRecord,
  HierarchizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceHierarchizabilityDomainInventory = {
  domain: HierarchizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildHierarchizabilityAdminRecords(
  inventory: WorkspaceHierarchizabilityDomainInventory[],
): HierarchizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildHierarchizabilityAdminStats(input: {
  records: HierarchizabilityAdminRecord[]
  postgresConnectivity: boolean
}): HierarchizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const hierarchizabilityPercent =
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
    hierarchizabilityPercent,
  }
}

export function getHierarchizabilityAdminGuidance(input: {
  stats: HierarchizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect hierarchizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial hierarchizability coverage and refresh the hierarchizability summary.'
  }

  if (input.stats.hierarchizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage hierarchizability below the 95% target and refresh the hierarchizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace hierarchizability coverage and refresh the hierarchizability summary.'
}

export function resolveHierarchizabilityAdminActions(): HierarchizabilityAdminAction[] {
  return ['refresh_hierarchizability_summary']
}

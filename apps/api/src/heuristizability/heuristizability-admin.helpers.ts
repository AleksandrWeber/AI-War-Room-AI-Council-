import type {
  HeuristizabilityAdminAction,
  HeuristizabilityAdminRecord,
  HeuristizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceHeuristizabilityDomainInventory = {
  domain: HeuristizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildHeuristizabilityAdminRecords(
  inventory: WorkspaceHeuristizabilityDomainInventory[],
): HeuristizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildHeuristizabilityAdminStats(input: {
  records: HeuristizabilityAdminRecord[]
  postgresConnectivity: boolean
}): HeuristizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_usage_limits')
      ?.recordCount ?? 0
  const heuristizabilityPercent =
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
    heuristizabilityPercent,
  }
}

export function getHeuristizabilityAdminGuidance(input: {
  stats: HeuristizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect heuristizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial heuristizability coverage and refresh the heuristizability summary.'
  }

  if (input.stats.heuristizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workspace limit heuristizability below the 95% target and refresh the heuristizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace heuristizability coverage and refresh the heuristizability summary.'
}

export function resolveHeuristizabilityAdminActions(): HeuristizabilityAdminAction[] {
  return ['refresh_heuristizability_summary']
}

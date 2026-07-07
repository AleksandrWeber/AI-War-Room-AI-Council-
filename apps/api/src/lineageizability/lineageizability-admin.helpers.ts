import type {
  LineageizabilityAdminAction,
  LineageizabilityAdminRecord,
  LineageizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceLineageizabilityDomainInventory = {
  domain: LineageizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildLineageizabilityAdminRecords(
  inventory: WorkspaceLineageizabilityDomainInventory[],
): LineageizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildLineageizabilityAdminStats(input: {
  records: LineageizabilityAdminRecord[]
  postgresConnectivity: boolean
}): LineageizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const lineageizabilityPercent =
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
    lineageizabilityPercent,
  }
}

export function getLineageizabilityAdminGuidance(input: {
  stats: LineageizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect lineageizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial lineageizability coverage and refresh the lineageizability summary.'
  }

  if (input.stats.lineageizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership lineageizability below the 95% target and refresh the lineageizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace lineageizability coverage and refresh the lineageizability summary.'
}

export function resolveLineageizabilityAdminActions(): LineageizabilityAdminAction[] {
  return ['refresh_lineageizability_summary']
}

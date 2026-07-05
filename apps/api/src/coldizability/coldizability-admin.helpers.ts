import type {
  ColdizabilityAdminAction,
  ColdizabilityAdminRecord,
  ColdizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceColdizabilityDomainInventory = {
  domain: ColdizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildColdizabilityAdminRecords(
  inventory: WorkspaceColdizabilityDomainInventory[],
): ColdizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildColdizabilityAdminStats(input: {
  records: ColdizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ColdizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_usage_limits')
      ?.recordCount ?? 0
  const coldizabilityPercent =
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
    coldizabilityPercent,
  }
}

export function getColdizabilityAdminGuidance(input: {
  stats: ColdizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect coldizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial coldizability coverage and refresh the coldizability summary.'
  }

  if (input.stats.coldizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workspace limit coldizability below the 95% target and refresh the coldizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace coldizability coverage and refresh the coldizability summary.'
}

export function resolveColdizabilityAdminActions(): ColdizabilityAdminAction[] {
  return ['refresh_coldizability_summary']
}

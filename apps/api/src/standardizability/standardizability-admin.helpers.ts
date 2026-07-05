import type {
  StandardizabilityAdminAction,
  StandardizabilityAdminRecord,
  StandardizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceStandardizabilityDomainInventory = {
  domain: StandardizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildStandardizabilityAdminRecords(
  inventory: WorkspaceStandardizabilityDomainInventory[],
): StandardizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildStandardizabilityAdminStats(input: {
  records: StandardizabilityAdminRecord[]
  postgresConnectivity: boolean
}): StandardizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_usage_limits')
      ?.recordCount ?? 0
  const standardizabilityPercent =
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
    standardizabilityPercent,
  }
}

export function getStandardizabilityAdminGuidance(input: {
  stats: StandardizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect standardizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial standardizability coverage and refresh the standardizability summary.'
  }

  if (input.stats.standardizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workspace limit standardizability below the 95% target and refresh the standardizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace standardizability coverage and refresh the standardizability summary.'
}

export function resolveStandardizabilityAdminActions(): StandardizabilityAdminAction[] {
  return ['refresh_standardizability_summary']
}

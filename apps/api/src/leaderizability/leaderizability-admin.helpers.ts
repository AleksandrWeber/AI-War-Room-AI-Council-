import type {
  LeaderizabilityAdminAction,
  LeaderizabilityAdminRecord,
  LeaderizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceLeaderizabilityDomainInventory = {
  domain: LeaderizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildLeaderizabilityAdminRecords(
  inventory: WorkspaceLeaderizabilityDomainInventory[],
): LeaderizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildLeaderizabilityAdminStats(input: {
  records: LeaderizabilityAdminRecord[]
  postgresConnectivity: boolean
}): LeaderizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_usage_limits')
      ?.recordCount ?? 0
  const leaderizabilityPercent =
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
    leaderizabilityPercent,
  }
}

export function getLeaderizabilityAdminGuidance(input: {
  stats: LeaderizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect leaderizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial leaderizability coverage and refresh the leaderizability summary.'
  }

  if (input.stats.leaderizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workspace limit leaderizability below the 95% target and refresh the leaderizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace leaderizability coverage and refresh the leaderizability summary.'
}

export function resolveLeaderizabilityAdminActions(): LeaderizabilityAdminAction[] {
  return ['refresh_leaderizability_summary']
}

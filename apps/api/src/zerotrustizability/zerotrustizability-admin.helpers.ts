import type {
  ZerotrustizabilityAdminAction,
  ZerotrustizabilityAdminRecord,
  ZerotrustizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceZerotrustizabilityDomainInventory = {
  domain: ZerotrustizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildZerotrustizabilityAdminRecords(
  inventory: WorkspaceZerotrustizabilityDomainInventory[],
): ZerotrustizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildZerotrustizabilityAdminStats(input: {
  records: ZerotrustizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ZerotrustizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const zerotrustizabilityPercent =
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
    zerotrustizabilityPercent,
  }
}

export function getZerotrustizabilityAdminGuidance(input: {
  stats: ZerotrustizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect zerotrustizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial zerotrustizability coverage and refresh the zerotrustizability summary.'
  }

  if (input.stats.zerotrustizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification zerotrustizability below the 95% target and refresh the zerotrustizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace zerotrustizability coverage and refresh the zerotrustizability summary.'
}

export function resolveZerotrustizabilityAdminActions(): ZerotrustizabilityAdminAction[] {
  return ['refresh_zerotrustizability_summary']
}

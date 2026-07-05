import type {
  MarketabilityAdminAction,
  MarketabilityAdminRecord,
  MarketabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceMarketabilityDomainInventory = {
  domain: MarketabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildMarketabilityAdminRecords(
  inventory: WorkspaceMarketabilityDomainInventory[],
): MarketabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildMarketabilityAdminStats(input: {
  records: MarketabilityAdminRecord[]
  postgresConnectivity: boolean
}): MarketabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const marketabilityPercent =
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
    marketabilityPercent,
  }
}

export function getMarketabilityAdminGuidance(input: {
  stats: MarketabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect marketability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial marketability coverage and refresh the marketability summary.'
  }

  if (input.stats.marketabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership marketability below the 95% target and refresh the marketability summary.'
  }

  return 'Workspace owners and admins can inspect workspace marketability coverage and refresh the marketability summary.'
}

export function resolveMarketabilityAdminActions(): MarketabilityAdminAction[] {
  return ['refresh_marketability_summary']
}

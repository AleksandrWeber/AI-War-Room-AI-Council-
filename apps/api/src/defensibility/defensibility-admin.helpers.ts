import type {
  DefensibilityAdminAction,
  DefensibilityAdminRecord,
  DefensibilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDefensibilityDomainInventory = {
  domain: DefensibilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDefensibilityAdminRecords(
  inventory: WorkspaceDefensibilityDomainInventory[],
): DefensibilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDefensibilityAdminStats(input: {
  records: DefensibilityAdminRecord[]
  postgresConnectivity: boolean
}): DefensibilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_reviews')
      ?.recordCount ?? 0
  const defensibilityPercent =
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
    defensibilityPercent,
  }
}

export function getDefensibilityAdminGuidance(input: {
  stats: DefensibilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect defensibility metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial defensibility coverage and refresh the defensibility summary.'
  }

  if (input.stats.defensibilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield review defensibility below the 95% target and refresh the defensibility summary.'
  }

  return 'Workspace owners and admins can inspect workspace defensibility coverage and refresh the defensibility summary.'
}

export function resolveDefensibilityAdminActions(): DefensibilityAdminAction[] {
  return ['refresh_defensibility_summary']
}

import type {
  LegibilityAdminAction,
  LegibilityAdminRecord,
  LegibilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceLegibilityDomainInventory = {
  domain: LegibilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildLegibilityAdminRecords(
  inventory: WorkspaceLegibilityDomainInventory[],
): LegibilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildLegibilityAdminStats(input: {
  records: LegibilityAdminRecord[]
  postgresConnectivity: boolean
}): LegibilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'artifacts')
      ?.recordCount ?? 0
  const legibilityPercent =
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
    legibilityPercent,
  }
}

export function getLegibilityAdminGuidance(input: {
  stats: LegibilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect legibility metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial legibility coverage and refresh the legibility summary.'
  }

  if (input.stats.legibilityPercent < 95) {
    return 'Workspace owners and admins can inspect artifact legibility below the 95% target and refresh the legibility summary.'
  }

  return 'Workspace owners and admins can inspect workspace legibility coverage and refresh the legibility summary.'
}

export function resolveLegibilityAdminActions(): LegibilityAdminAction[] {
  return ['refresh_legibility_summary']
}

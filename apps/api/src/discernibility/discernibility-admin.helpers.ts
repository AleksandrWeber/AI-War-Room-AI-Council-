import type {
  DiscernibilityAdminAction,
  DiscernibilityAdminRecord,
  DiscernibilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDiscernibilityDomainInventory = {
  domain: DiscernibilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDiscernibilityAdminRecords(
  inventory: WorkspaceDiscernibilityDomainInventory[],
): DiscernibilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDiscernibilityAdminStats(input: {
  records: DiscernibilityAdminRecord[]
  postgresConnectivity: boolean
}): DiscernibilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'moderator_syntheses')
      ?.recordCount ?? 0
  const discernibilityPercent =
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
    discernibilityPercent,
  }
}

export function getDiscernibilityAdminGuidance(input: {
  stats: DiscernibilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect discernibility metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial discernibility coverage and refresh the discernibility summary.'
  }

  if (input.stats.discernibilityPercent < 95) {
    return 'Workspace owners and admins can inspect moderator synthesis discernibility below the 95% target and refresh the discernibility summary.'
  }

  return 'Workspace owners and admins can inspect workspace discernibility coverage and refresh the discernibility summary.'
}

export function resolveDiscernibilityAdminActions(): DiscernibilityAdminAction[] {
  return ['refresh_discernibility_summary']
}

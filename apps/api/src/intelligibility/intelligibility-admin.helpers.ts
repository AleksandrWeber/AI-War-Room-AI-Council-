import type {
  IntelligibilityAdminAction,
  IntelligibilityAdminRecord,
  IntelligibilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceIntelligibilityDomainInventory = {
  domain: IntelligibilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildIntelligibilityAdminRecords(
  inventory: WorkspaceIntelligibilityDomainInventory[],
): IntelligibilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildIntelligibilityAdminStats(input: {
  records: IntelligibilityAdminRecord[]
  postgresConnectivity: boolean
}): IntelligibilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'moderator_syntheses')
      ?.recordCount ?? 0
  const intelligibilityPercent =
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
    intelligibilityPercent,
  }
}

export function getIntelligibilityAdminGuidance(input: {
  stats: IntelligibilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect intelligibility metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial intelligibility coverage and refresh the intelligibility summary.'
  }

  if (input.stats.intelligibilityPercent < 95) {
    return 'Workspace owners and admins can inspect moderator synthesis intelligibility below the 95% target and refresh the intelligibility summary.'
  }

  return 'Workspace owners and admins can inspect workspace intelligibility coverage and refresh the intelligibility summary.'
}

export function resolveIntelligibilityAdminActions(): IntelligibilityAdminAction[] {
  return ['refresh_intelligibility_summary']
}

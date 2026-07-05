import type {
  ComprehensibilityAdminAction,
  ComprehensibilityAdminRecord,
  ComprehensibilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceComprehensibilityDomainInventory = {
  domain: ComprehensibilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildComprehensibilityAdminRecords(
  inventory: WorkspaceComprehensibilityDomainInventory[],
): ComprehensibilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildComprehensibilityAdminStats(input: {
  records: ComprehensibilityAdminRecord[]
  postgresConnectivity: boolean
}): ComprehensibilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'agent_outputs')
      ?.recordCount ?? 0
  const comprehensibilityPercent =
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
    comprehensibilityPercent,
  }
}

export function getComprehensibilityAdminGuidance(input: {
  stats: ComprehensibilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect comprehensibility metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial comprehensibility coverage and refresh the comprehensibility summary.'
  }

  if (input.stats.comprehensibilityPercent < 95) {
    return 'Workspace owners and admins can inspect agent output comprehensibility below the 95% target and refresh the comprehensibility summary.'
  }

  return 'Workspace owners and admins can inspect workspace comprehensibility coverage and refresh the comprehensibility summary.'
}

export function resolveComprehensibilityAdminActions(): ComprehensibilityAdminAction[] {
  return ['refresh_comprehensibility_summary']
}

import type {
  FlexibilityAdminAction,
  FlexibilityAdminRecord,
  FlexibilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceFlexibilityDomainInventory = {
  domain: FlexibilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildFlexibilityAdminRecords(
  inventory: WorkspaceFlexibilityDomainInventory[],
): FlexibilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildFlexibilityAdminStats(input: {
  records: FlexibilityAdminRecord[]
  postgresConnectivity: boolean
}): FlexibilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'run_workflows')
      ?.recordCount ?? 0
  const flexibilityPercent =
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
    flexibilityPercent,
  }
}

export function getFlexibilityAdminGuidance(input: {
  stats: FlexibilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect flexibility metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial flexibility coverage and refresh the flexibility summary.'
  }

  if (input.stats.flexibilityPercent < 95) {
    return 'Workspace owners and admins can inspect workflow flexibility below the 95% target and refresh the flexibility summary.'
  }

  return 'Workspace owners and admins can inspect workspace flexibility coverage and refresh the flexibility summary.'
}

export function resolveFlexibilityAdminActions(): FlexibilityAdminAction[] {
  return ['refresh_flexibility_summary']
}

import type {
  TeachabilityAdminAction,
  TeachabilityAdminRecord,
  TeachabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTeachabilityDomainInventory = {
  domain: TeachabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTeachabilityAdminRecords(
  inventory: WorkspaceTeachabilityDomainInventory[],
): TeachabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTeachabilityAdminStats(input: {
  records: TeachabilityAdminRecord[]
  postgresConnectivity: boolean
}): TeachabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'run_workflows')
      ?.recordCount ?? 0
  const teachabilityPercent =
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
    teachabilityPercent,
  }
}

export function getTeachabilityAdminGuidance(input: {
  stats: TeachabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect teachability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial teachability coverage and refresh the teachability summary.'
  }

  if (input.stats.teachabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workflow teachability below the 95% target and refresh the teachability summary.'
  }

  return 'Workspace owners and admins can inspect workspace teachability coverage and refresh the teachability summary.'
}

export function resolveTeachabilityAdminActions(): TeachabilityAdminAction[] {
  return ['refresh_teachability_summary']
}

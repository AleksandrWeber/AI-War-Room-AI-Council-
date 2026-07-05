import type {
  SchedulabilityAdminAction,
  SchedulabilityAdminRecord,
  SchedulabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSchedulabilityDomainInventory = {
  domain: SchedulabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSchedulabilityAdminRecords(
  inventory: WorkspaceSchedulabilityDomainInventory[],
): SchedulabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSchedulabilityAdminStats(input: {
  records: SchedulabilityAdminRecord[]
  postgresConnectivity: boolean
}): SchedulabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const schedulabilityPercent =
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
    schedulabilityPercent,
  }
}

export function getSchedulabilityAdminGuidance(input: {
  stats: SchedulabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect schedulability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial schedulability coverage and refresh the schedulability summary.'
  }

  if (input.stats.schedulabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage schedulability below the 95% target and refresh the schedulability summary.'
  }

  return 'Workspace owners and admins can inspect workspace schedulability coverage and refresh the schedulability summary.'
}

export function resolveSchedulabilityAdminActions(): SchedulabilityAdminAction[] {
  return ['refresh_schedulability_summary']
}

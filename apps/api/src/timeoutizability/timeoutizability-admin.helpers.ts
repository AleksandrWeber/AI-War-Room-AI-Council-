import type {
  TimeoutizabilityAdminAction,
  TimeoutizabilityAdminRecord,
  TimeoutizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTimeoutizabilityDomainInventory = {
  domain: TimeoutizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTimeoutizabilityAdminRecords(
  inventory: WorkspaceTimeoutizabilityDomainInventory[],
): TimeoutizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTimeoutizabilityAdminStats(input: {
  records: TimeoutizabilityAdminRecord[]
  postgresConnectivity: boolean
}): TimeoutizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const timeoutizabilityPercent =
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
    timeoutizabilityPercent,
  }
}

export function getTimeoutizabilityAdminGuidance(input: {
  stats: TimeoutizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect timeoutizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial timeoutizability coverage and refresh the timeoutizability summary.'
  }

  if (input.stats.timeoutizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification timeoutizability below the 95% target and refresh the timeoutizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace timeoutizability coverage and refresh the timeoutizability summary.'
}

export function resolveTimeoutizabilityAdminActions(): TimeoutizabilityAdminAction[] {
  return ['refresh_timeoutizability_summary']
}

import type {
  WarmizabilityAdminAction,
  WarmizabilityAdminRecord,
  WarmizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceWarmizabilityDomainInventory = {
  domain: WarmizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildWarmizabilityAdminRecords(
  inventory: WorkspaceWarmizabilityDomainInventory[],
): WarmizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildWarmizabilityAdminStats(input: {
  records: WarmizabilityAdminRecord[]
  postgresConnectivity: boolean
}): WarmizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const warmizabilityPercent =
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
    warmizabilityPercent,
  }
}

export function getWarmizabilityAdminGuidance(input: {
  stats: WarmizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect warmizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial warmizability coverage and refresh the warmizability summary.'
  }

  if (input.stats.warmizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage warmizability below the 95% target and refresh the warmizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace warmizability coverage and refresh the warmizability summary.'
}

export function resolveWarmizabilityAdminActions(): WarmizabilityAdminAction[] {
  return ['refresh_warmizability_summary']
}

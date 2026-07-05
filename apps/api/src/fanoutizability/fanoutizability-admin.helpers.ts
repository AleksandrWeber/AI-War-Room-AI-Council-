import type {
  FanoutizabilityAdminAction,
  FanoutizabilityAdminRecord,
  FanoutizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceFanoutizabilityDomainInventory = {
  domain: FanoutizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildFanoutizabilityAdminRecords(
  inventory: WorkspaceFanoutizabilityDomainInventory[],
): FanoutizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildFanoutizabilityAdminStats(input: {
  records: FanoutizabilityAdminRecord[]
  postgresConnectivity: boolean
}): FanoutizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const fanoutizabilityPercent =
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
    fanoutizabilityPercent,
  }
}

export function getFanoutizabilityAdminGuidance(input: {
  stats: FanoutizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect fanoutizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial fanoutizability coverage and refresh the fanoutizability summary.'
  }

  if (input.stats.fanoutizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage fanoutizability below the 95% target and refresh the fanoutizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace fanoutizability coverage and refresh the fanoutizability summary.'
}

export function resolveFanoutizabilityAdminActions(): FanoutizabilityAdminAction[] {
  return ['refresh_fanoutizability_summary']
}

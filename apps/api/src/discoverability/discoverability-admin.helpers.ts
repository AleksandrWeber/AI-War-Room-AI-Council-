import type {
  DiscoverabilityAdminAction,
  DiscoverabilityAdminRecord,
  DiscoverabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDiscoverabilityDomainInventory = {
  domain: DiscoverabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDiscoverabilityAdminRecords(
  inventory: WorkspaceDiscoverabilityDomainInventory[],
): DiscoverabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDiscoverabilityAdminStats(input: {
  records: DiscoverabilityAdminRecord[]
  postgresConnectivity: boolean
}): DiscoverabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const discoverabilityPercent =
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
    discoverabilityPercent,
  }
}

export function getDiscoverabilityAdminGuidance(input: {
  stats: DiscoverabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect discoverability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial discoverability coverage and refresh the discoverability summary.'
  }

  if (input.stats.discoverabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage discoverability below the 95% target and refresh the discoverability summary.'
  }

  return 'Workspace owners and admins can inspect workspace discoverability coverage and refresh the discoverability summary.'
}

export function resolveDiscoverabilityAdminActions(): DiscoverabilityAdminAction[] {
  return ['refresh_discoverability_summary']
}

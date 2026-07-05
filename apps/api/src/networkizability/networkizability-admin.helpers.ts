import type {
  NetworkizabilityAdminAction,
  NetworkizabilityAdminRecord,
  NetworkizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceNetworkizabilityDomainInventory = {
  domain: NetworkizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildNetworkizabilityAdminRecords(
  inventory: WorkspaceNetworkizabilityDomainInventory[],
): NetworkizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildNetworkizabilityAdminStats(input: {
  records: NetworkizabilityAdminRecord[]
  postgresConnectivity: boolean
}): NetworkizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const networkizabilityPercent =
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
    networkizabilityPercent,
  }
}

export function getNetworkizabilityAdminGuidance(input: {
  stats: NetworkizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect networkizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial networkizability coverage and refresh the networkizability summary.'
  }

  if (input.stats.networkizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage networkizability below the 95% target and refresh the networkizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace networkizability coverage and refresh the networkizability summary.'
}

export function resolveNetworkizabilityAdminActions(): NetworkizabilityAdminAction[] {
  return ['refresh_networkizability_summary']
}

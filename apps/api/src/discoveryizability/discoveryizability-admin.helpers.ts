import type {
  DiscoveryizabilityAdminAction,
  DiscoveryizabilityAdminRecord,
  DiscoveryizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDiscoveryizabilityDomainInventory = {
  domain: DiscoveryizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDiscoveryizabilityAdminRecords(
  inventory: WorkspaceDiscoveryizabilityDomainInventory[],
): DiscoveryizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDiscoveryizabilityAdminStats(input: {
  records: DiscoveryizabilityAdminRecord[]
  postgresConnectivity: boolean
}): DiscoveryizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const discoveryizabilityPercent =
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
    discoveryizabilityPercent,
  }
}

export function getDiscoveryizabilityAdminGuidance(input: {
  stats: DiscoveryizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect discoveryizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial discoveryizability coverage and refresh the discoveryizability summary.'
  }

  if (input.stats.discoveryizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook discoveryizability below the 95% target and refresh the discoveryizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace discoveryizability coverage and refresh the discoveryizability summary.'
}

export function resolveDiscoveryizabilityAdminActions(): DiscoveryizabilityAdminAction[] {
  return ['refresh_discoveryizability_summary']
}

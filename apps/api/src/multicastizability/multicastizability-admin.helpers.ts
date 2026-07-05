import type {
  MulticastizabilityAdminAction,
  MulticastizabilityAdminRecord,
  MulticastizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceMulticastizabilityDomainInventory = {
  domain: MulticastizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildMulticastizabilityAdminRecords(
  inventory: WorkspaceMulticastizabilityDomainInventory[],
): MulticastizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildMulticastizabilityAdminStats(input: {
  records: MulticastizabilityAdminRecord[]
  postgresConnectivity: boolean
}): MulticastizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const multicastizabilityPercent =
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
    multicastizabilityPercent,
  }
}

export function getMulticastizabilityAdminGuidance(input: {
  stats: MulticastizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect multicastizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial multicastizability coverage and refresh the multicastizability summary.'
  }

  if (input.stats.multicastizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification multicastizability below the 95% target and refresh the multicastizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace multicastizability coverage and refresh the multicastizability summary.'
}

export function resolveMulticastizabilityAdminActions(): MulticastizabilityAdminAction[] {
  return ['refresh_multicastizability_summary']
}

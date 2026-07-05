import type {
  ChainingizabilityAdminAction,
  ChainingizabilityAdminRecord,
  ChainingizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceChainingizabilityDomainInventory = {
  domain: ChainingizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildChainingizabilityAdminRecords(
  inventory: WorkspaceChainingizabilityDomainInventory[],
): ChainingizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildChainingizabilityAdminStats(input: {
  records: ChainingizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ChainingizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const chainingizabilityPercent =
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
    chainingizabilityPercent,
  }
}

export function getChainingizabilityAdminGuidance(input: {
  stats: ChainingizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect chainingizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial chainingizability coverage and refresh the chainingizability summary.'
  }

  if (input.stats.chainingizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan chainingizability below the 95% target and refresh the chainingizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace chainingizability coverage and refresh the chainingizability summary.'
}

export function resolveChainingizabilityAdminActions(): ChainingizabilityAdminAction[] {
  return ['refresh_chainingizability_summary']
}

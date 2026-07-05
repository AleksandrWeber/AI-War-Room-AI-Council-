import type {
  PartitionizabilityAdminAction,
  PartitionizabilityAdminRecord,
  PartitionizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspacePartitionizabilityDomainInventory = {
  domain: PartitionizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildPartitionizabilityAdminRecords(
  inventory: WorkspacePartitionizabilityDomainInventory[],
): PartitionizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildPartitionizabilityAdminStats(input: {
  records: PartitionizabilityAdminRecord[]
  postgresConnectivity: boolean
}): PartitionizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const partitionizabilityPercent =
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
    partitionizabilityPercent,
  }
}

export function getPartitionizabilityAdminGuidance(input: {
  stats: PartitionizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect partitionizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial partitionizability coverage and refresh the partitionizability summary.'
  }

  if (input.stats.partitionizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan partitionizability below the 95% target and refresh the partitionizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace partitionizability coverage and refresh the partitionizability summary.'
}

export function resolvePartitionizabilityAdminActions(): PartitionizabilityAdminAction[] {
  return ['refresh_partitionizability_summary']
}
